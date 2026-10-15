"""Validated editable content and explicit, configurable prototype policies."""
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator

CATEGORIES = ['Environment', 'Health', 'Science', 'Education', 'Public Policy',
              'Economic Policy', 'Community', 'Arts & Culture', 'Business', 'Other']
CHANNELS = ['Instagram', 'Facebook', 'Display']
PUBLIC_STATES = {'Available for Funding', 'Funding Goal Reached', 'Funding Period Ends',
                 'Distribution Preparation', 'Promoting', 'Completed', 'Cancelled',
                 'Refund Pending', 'Failed'}
EDITABLE_STATES = {'Draft', 'Changes Requested', 'Approved', 'Available for Funding',
                   'Funding Goal Reached', 'Funding Period Ends', 'Distribution Preparation', 'Promoting'}
DEFAULT_PREFERENCES = {'categories': {'campaigns': True, 'payments': True, 'security': True},
                       'delivery': {'inApp': True, 'push': False, 'email': False}}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def stamp(value: datetime | None = None) -> str:
    return (value or utcnow()).isoformat().replace('+00:00', 'Z')


def parse_stamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def cents(value: object, *, allow_zero: bool = False, maximum: int = 10_000_000) -> int:
    """Reject excess precision rather than silently changing a creator/backer's amount."""
    try:
        decimal = Decimal(str(value))
    except (ValueError, InvalidOperation):
        raise ValueError('Enter a valid USD amount.')
    if not decimal.is_finite() or decimal < 0 or (not allow_zero and decimal == 0):
        raise ValueError('Amount must be positive.')
    if decimal.as_tuple().exponent < -2 or decimal * 100 > maximum:
        raise ValueError(f'Use at most two decimal places and a maximum of ${maximum / 100:,.2f}.')
    return int(decimal * 100)


def dollars(value: int) -> float:
    return value / 100


def fee_for(amount: int, rate: Decimal) -> int:
    return int((Decimal(amount) * rate).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def estimated_reach(net_cents: int, people_per_ad_dollar: float) -> int:
    return int(Decimal(net_cents) / 100 * Decimal(str(people_per_ad_dollar)))


def safe_url(value: str, *, media: bool = False) -> str:
    if not value:
        return value
    if media and value.startswith(('/media/', '/seed-media/')) and '..' not in value:
        return value
    parsed = urlparse(value)
    if parsed.scheme not in {'http', 'https'} or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('Use a public http:// or https:// URL.')
    return value


class StorySection(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str = Field(min_length=1, max_length=100)
    kind: Literal['text', 'heading', 'image', 'statistic', 'action'] = 'text'
    text: str = Field(default='', max_length=15000)
    format: Literal['plain', 'normal', 'bold', 'italic', 'bullet'] = 'plain'
    url: str = Field(default='', max_length=2000)
    caption: str = Field(default='', max_length=1000)
    credit: str = Field(default='', max_length=300)

    @field_validator('url')
    @classmethod
    def url_is_safe(cls, value: str) -> str:
        return safe_url(value, media=True)


class Source(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str = Field(min_length=1, max_length=100)
    title: str = Field(default='', max_length=300)
    url: str = Field(default='', max_length=2000)

    @field_validator('url')
    @classmethod
    def source_is_safe(cls, value: str) -> str:
        return safe_url(value)


class CampaignContent(BaseModel):
    """Drafts may be incomplete. Submission has separate completeness validation."""
    model_config = ConfigDict(extra='ignore')
    title: str = Field(default='', max_length=60)
    category: str = Field(default='', max_length=100)
    creatorName: str = Field(default='', max_length=150)
    summary: str = Field(default='', max_length=2000)
    coverImage: str = Field(default='', max_length=2000)
    storyHeadline: str = Field(default='', max_length=200)
    intro: str = Field(default='', max_length=15000)
    sections: list[StorySection] = Field(default_factory=list, max_length=80)
    sources: list[Source] = Field(default_factory=list, max_length=50)
    adImages: list[str] = Field(default_factory=list, max_length=20)
    adHeadline: str = Field(default='', max_length=150)
    adDescription: str = Field(default='', max_length=2000)
    cta: str = Field(default='Learn more', max_length=100)
    geography: str = Field(default='', max_length=1000)
    interests: str = Field(default='', max_length=1000)
    channels: list[str] = Field(default_factory=lambda: ['Instagram', 'Facebook'], max_length=3)
    allocation: dict[str, float] = Field(default_factory=lambda: {'Instagram': 60, 'Facebook': 40})
    durationDays: int = Field(default=14, ge=1, le=90)
    goal: float = Field(default=0, ge=0, le=100000)
    currentStep: int = Field(default=0, ge=0, le=4)
    featured: bool = False

    @field_validator('category')
    @classmethod
    def supported_category(cls, value: str) -> str:
        if value and value not in CATEGORIES:
            raise ValueError('Select a supported category.')
        return value

    @field_validator('channels')
    @classmethod
    def supported_channels(cls, value: list[str]) -> list[str]:
        if len(value) != len(set(value)) or any(item not in CHANNELS for item in value):
            raise ValueError('Select supported channels without duplicates.')
        return value

    @field_validator('coverImage')
    @classmethod
    def image_is_safe(cls, value: str) -> str:
        return safe_url(value, media=True)

    @field_validator('adImages')
    @classmethod
    def ads_are_safe(cls, value: list[str]) -> list[str]:
        return [safe_url(item, media=True) for item in value]

    @field_validator('allocation')
    @classmethod
    def valid_allocation(cls, value: dict[str, float]) -> dict[str, float]:
        if any(k not in CHANNELS or not 0 <= v <= 100 for k, v in value.items()):
            raise ValueError('Allocation must use supported channels and percentages from 0 to 100.')
        return value

    @field_validator('goal')
    @classmethod
    def precise_goal(cls, value: float) -> float:
        cents(value, allow_zero=True)
        return value


def submission_errors(content: dict) -> dict[str, str]:
    errors = {}
    for field, label in [('title', 'Campaign title'), ('category', 'Category'), ('creatorName', 'Creator name')]:
        if not content[field].strip():
            errors[field] = f'{label} is required.'
    if content['goal'] <= 0:
        errors['goal'] = 'Set a positive funding goal in Submit.'
    if not content['geography'].strip():
        errors['geography'] = 'Describe your intended geography.'
    if not content['channels']:
        errors['channels'] = 'Select at least one distribution channel.'
    if set(content['allocation']) != set(content['channels']) or abs(sum(content['allocation'].values()) - 100) > 0.01:
        errors['allocation'] = 'Allocate exactly 100% across the selected channels.'
    if any(not source['title'].strip() or not source['url'].strip() for source in content['sources']):
        errors['sources'] = 'Each added source needs a title and URL, or remove the empty source.'
    return errors

