"""Bind an exact packaged API constant to the real Hermes getApiUrl getter.

No API, device or service access. Disassembly and evidence stay beside the
project-owned report requested by android-local.ps1.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess


def function_blocks(lines):
    starts = [i for i, line in enumerate(lines) if re.match(r"^(?:NC)?Function<.*>\(", line)]
    return [lines[start:end] for start, end in zip(starts, starts[1:] + [len(lines)])]


def inspect_assignment(raw_text, pretty_text, expected):
    raw_lines = raw_text.splitlines()
    raw_blocks = function_blocks(raw_lines)
    pretty_blocks = function_blocks(pretty_text.splitlines())
    matching = [line for line in raw_lines if re.fullmatch(r"s\d+\[[^\]]+\]: " + re.escape(expected), line)]
    if len(matching) != 1 or len(raw_blocks) != len(pretty_blocks):
        return {"verifiedAssignment": False, "reason": "Expected one exact API constant and matching function inventories."}
    string_id = int(re.match(r"s(\d+)", matching[0])[1])
    getters = [block for block in raw_blocks if re.match(r"^(?:NC)?Function<getApiUrl>\(", block[0])]
    if len(getters) != 1:
        return {"verifiedAssignment": False, "reason": "Expected one identifiable getApiUrl getter."}
    getter = getters[0]
    for index, block in enumerate(raw_blocks):
        for offset, line in enumerate(block):
            load = re.search(r"LoadConstString(?:LongIndex)? (\d+)<Reg8>, " + str(string_id) + r"<UInt(?:16|32)>$", line)
            if not load or offset + 1 >= len(block):
                continue
            store = re.search(r"StoreToEnvironment(?:L)? (\d+)<Reg8>, (\d+)<UInt(?:8|16)>, (\d+)<Reg8>$", block[offset + 1])
            if not store or store[3] != load[1]:
                continue
            environment, slot = store[1], store[2]
            pretty = pretty_blocks[index]
            if block[0] != pretty[0]:
                continue
            closures = [text for text in pretty if re.search(r"CreateClosure\s+r\d+, r" + environment + r", (?:NC)?Function<getApiUrl>", text)]
            environment_reads = [re.search(r"GetEnvironment (\d+)<Reg8>, 0<UInt8>$", text) for text in getter]
            environment_reads = [value for value in environment_reads if value]
            if not closures or len(environment_reads) != 1:
                continue
            getter_environment = environment_reads[0][1]
            reads = [re.search(r"LoadFromEnvironment(?:L)? (\d+)<Reg8>, " + getter_environment + r"<Reg8>, " + slot + r"<UInt(?:8|16)>$", text) for text in getter]
            reads = [value for value in reads if value]
            if len(reads) != 1 or not any(re.search(r"Ret " + reads[0][1] + r"<Reg8>$", text) for text in getter):
                continue
            return {"verifiedAssignment": True, "apiUrl": expected, "matchingStringEntry": matching[0],
                    "apiEnvironmentSlot": int(slot), "rawInitializationRows": block[max(0, offset-1):offset+4],
                    "rawGetterRows": getter, "method": "Exact packaged constant stored in the same module environment slot read and returned by getApiUrl",
                    "scope": "Literal initialization/getter-slot linkage. Compiled-source and installed runtime checks are still required for subsequent URL normalization and saved-override behavior."}
    return {"verifiedAssignment": False, "reason": "API string presence did not prove its initialization/getter assignment."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bundle", required=True)
    parser.add_argument("--hermes", required=True)
    parser.add_argument("--expected-url", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args()
    report = Path(args.report)
    root = Path(__file__).resolve().parent.parent
    if str(root).lower() != r"e:\campaign" or not report.resolve().is_relative_to(root) or not Path(args.bundle).resolve().is_relative_to(root) or not Path(args.hermes).resolve().is_relative_to(root):
        raise SystemExit("Android inspection paths must remain inside E:\\Campaign.")
    paths = {"raw": report.with_suffix(".raw.txt"), "pretty": report.with_suffix(".pretty.txt")}
    texts = {}
    for name, path in paths.items():
        command = [args.hermes, "-b", "-dump-bytecode"]
        if name == "raw":
            command.append("-pretty=false")
        command.append(args.bundle)
        result = subprocess.run(command, capture_output=True, timeout=120, check=False)
        path.write_bytes(result.stdout)
        report.with_suffix(f".{name}.stderr.txt").write_bytes(result.stderr)
        if result.returncode:
            raise SystemExit("Packaged Hermes disassembly failed; artifact publication stopped.")
        texts[name] = result.stdout.decode("utf-8-sig")
    evidence = inspect_assignment(texts["raw"], texts["pretty"], args.expected_url)
    evidence["embeddedBundleSha256"] = hashlib.sha256(Path(args.bundle).read_bytes()).hexdigest()
    evidence["disassemblyPaths"] = {key: str(value) for key, value in paths.items()}
    report.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    if not evidence["verifiedAssignment"]:
        raise SystemExit(evidence["reason"])
    print("PACKAGED_API_ASSIGNMENT_VERIFIED")


if __name__ == "__main__":
    main()
