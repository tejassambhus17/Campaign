function ConvertTo-CampaignCloudApiUrl {
  param([Parameter(Mandatory=$true)][AllowEmptyString()][string]$Value)
  $parsed = $null
  if (![Uri]::TryCreate($Value.Trim(), [UriKind]::Absolute, [ref]$parsed)) {
    throw 'CloudTest requires a deployed public HTTPS backend URL.'
  }
  $hostName = $parsed.DnsSafeHost.ToLowerInvariant()
  if ($parsed.Scheme -ne 'https' -or $parsed.UserInfo -or $Value.Contains('?') -or $Value.Contains('#') -or
      $hostName -notmatch '^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$' -or
      $hostName -match '(?:^|\.)(?:localhost|local|localdomain|internal|test|invalid|example|lan|home|intranet|onion|arpa)$' -or
      $hostName -match '(?:^|\.)example\.(?:com|net|org)$') {
    throw 'CloudTest requires a public HTTPS hostname without credentials, a query or a fragment; local addresses are not allowed.'
  }
  return $parsed.AbsoluteUri.TrimEnd('/')
}
