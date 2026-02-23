# Lagom WHMCS Template Prototype Pollution

## Proof of Concept (PoC) Exploit

This repository contains a Proof of Concept (PoC) exploit for a prototype pollution vulnerability discovered in the **Lagom WHMCS Template version 2.3.7**.

## Description

The Lagom WHMCS Template version 2.3.7 bundles an outdated version of the `datatables.net` JavaScript library (prior to version 1.10.23). This outdated version contains a prototype pollution vulnerability that exposes the internal function `_fnSetObjectDataFn` through `jQuery.fn.dataTable.ext.internal._fnSetObjectDataFn`.

An attacker can exploit this to pollute the global `Object.prototype` with arbitrary properties, leading to:

- **Cross-Site Scripting (XSS)** - via `toString()` pollution
- **Validation Bypass** - via `exec()` and `test()` pollution
- **Denial of Service (DoS)** - via function replacement
- **Security Control Bypass** - affecting any code that relies on object properties

The vulnerability can be triggered by any visitor to a page using the affected template without requiring authentication.

## Affected Versions

- **Lagom WHMCS Template**: 2.3.7 (confirmed)
- **Potentially earlier versions** that bundle `datatables.net` < 1.10.23

## PoC Usage

### Prerequisites

- A website using Lagom WHMCS Template version 2.3.7
- Browser with Developer Tools (F12)

### Steps

1. Open the target website in your browser
2. Open Developer Tools (F12) and go to the Console tab
3. Copy and paste the entire PoC script
4. Press Enter to execute

### Commands

After execution, the following commands are available:

| Command | Description |
|---------|-------------|
| `poc.status()` | Check current pollution status |
| `poc.runXSS()` | Run XSS test via toString pollution |
| `poc.runBypass()` | Run validation bypass test |
| `poc.runDoS()` | Run Denial of Service test |
| `poc.runAll()` | Run all tests |
| `poc.cleanup()` | Remove all prototype pollution |

### Example Output
