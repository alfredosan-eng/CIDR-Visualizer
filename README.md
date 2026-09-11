<p align="center">
  <a href=https://alfredosan-eng.github.io/cidr-visualizer/>
    <img src="https://img.shields.io/badge/🧮%20OPEN%20SUBNETTING%20TOOLS-4285F4?style=for-the-badge&labelColor=202124" alt="Open Subnetting Tools">
  </a>
</p>


# CIDR Visualizer v2 "Classless Inter-Domain Routing"

## Interactive IPv4 & IPv6 Prefix Explorer

**CIDR Visualizer** is an educational, browser-only web application for understanding what the number after `/` actually does to an IP address.

v2 keeps the original four-section learning path and adds a stronger visual explanation of the prefix boundary, richer IPv6 support, and clearer IPv4 subnet warnings.

---

## What changed in v2?

### 1. The prefix boundary is now visible

The learning section now shows the 32 IPv4 bits divided into two areas:

```text
PREFIX / NETWORK                         HOST / REMAINING
111111111111111111111111111             11111
<----------- 27 ----------->             <-5->
```

When `/` increases, one bit moves from the remaining side into the prefix side. That bit becomes part of the network/prefix definition and therefore reduces the number of possible host values.

When `/` decreases, the opposite happens.

This is the central visual idea of CIDR Visualizer v2.

---

# IPv4 prefix logic

IPv4 has 32 bits.

For `/n`:

```text
Prefix bits  = n
Remaining bits = 32 - n
Total addresses = 2^(32-n)
```

For example:

```text
192.168.1.0/24
```

has:

```text
24 prefix bits
8 host bits
2^8 = 256 total addresses
```

With `/25`:

```text
25 prefix bits
7 host bits
2^7 = 128 total addresses
```

The block is half as large because one bit was moved from the host side to the prefix side.

---

# IPv6 support

IPv6 has 128 bits.

For `/n`:

```text
Prefix bits = n
Remaining bits = 128-n
```

v2 adds:

- `/0` to `/128` prefix exploration;
- hexadecimal group inspection;
- IPv6 expanded and compressed notation;
- prefix-to-mask visualization;
- beginning and end of an IPv6 prefix;
- IPv6 subnet calculation;
- explicit explanation that IPv6 does not use broadcast.

Example:

```text
2001:db8:1234:5678::1/64
```

means:

```text
64 prefix bits
64 remaining bits
```

IPv6 does **not** use the IPv4 broadcast model. RFC 4291 states that there are no broadcast addresses in IPv6; multicast provides the corresponding one-to-many mechanism. It also states that zero and one values are legal for IPv6 fields unless specifically excluded.

---

# IPv6 hexadecimal → binary

Each IPv6 hexadecimal digit represents four bits.

For example:

```text
A = 1010
F = 1111
```

Therefore:

```text
0x2001
```

is:

```text
0010 0000 0000 0001
```

The application includes an interactive converter so the relationship can be explored without memorizing it blindly.

---

# IPv6 compression and expansion

The converter accepts a full IPv6 address such as:

```text
2001:0db8:0000:0000:0000:ff00:0042:8329
```

and displays its compressed form:

```text
2001:db8::ff00:42:8329
```

The expanded representation is preserved so the user can see exactly which zero groups were removed.

---

# IPv4 subnetting warnings

v2 intentionally explains three messages that often appear in subnet calculators.

## No network or broadcast

This is the special case of a `/31` IPv4 prefix used on a point-to-point link.

A `/31` leaves only one host bit and therefore exactly two addresses. RFC 3021 defines that, on a point-to-point link, those two values are interpreted as addresses of the two endpoints rather than reserving one as the Network Address and one as the Broadcast Address.

The tool therefore does **not** present `/31` as an ordinary two-host LAN.

## Warning! Subnet is all 0's

This means the subnet bits themselves are all zero. It is the first subnet produced from the original network.

RFC 950 historically recommended not assigning all-zero and all-one subnet values because of ambiguity with special addresses.

That historical rule should not be presented as a universal modern prohibition. RFC 1878 explicitly includes all-zero and all-one subnets in the standards-based table and calls the practice of excluding them obsolete.

The tool therefore displays the warning as a **historical/compatibility warning**, not as “this network is forbidden”.

## Warning! Subnet is all 1's

This means all subnet bits are one. It is the last subnet in the parent block.

The historical concern was that an all-ones subnet could create confusion with the broadcast address of the original network. Cisco documents that the all-ones subnet can be used today, although configuration mistakes can still create ambiguity.

Again, v2 presents this as a compatibility/history warning rather than a blanket prohibition.

---

# Learning chain

The intended learning path is:

```text
PREFIX
   ↓
NUMBER OF PREFIX BITS
   ↓
THE BOUNDARY MOVES
   ↓
REMAINING BITS
   ↓
BINARY MASK
   ↓
DECIMAL / HEX MASK
   ↓
BLOCK SIZE / ADDRESS SPACE
   ↓
NETWORK OR PREFIX BOUNDARY
```

For IPv4 subnetting, the next step is:

```text
NETWORK
   ↓
BROADCAST
   ↓
USABLE HOST RANGE
```

For IPv6, the path deliberately stops using the IPv4 broadcast concept.

---

# Sections

## APRENDER

Explains the `/` prefix and visually demonstrates why bits appear to “lock” as the prefix increases.

## EXPLORAR PREFIJO

Interactive `/0 → /32` for IPv4 and `/0 → /128` for IPv6.

Shows:

- prefix length;
- prefix bits;
- remaining bits;
- address-space size;
- binary mask;
- IPv4 decimal mask or IPv6 hexadecimal mask;
- visual prefix boundary.

## CONVERTIR

Includes:

```text
IPv4 Decimal → Binary
IPv4 Binary → Decimal
IPv6 Hex → Binary
IPv6 Expand → Compress
IPv4 Prefix → Mask
IPv6 Prefix → Hexadecimal Mask
```

## SUBNETTING

Includes:

- IPv4 network/broadcast calculation;
- host range;
- `/31` point-to-point warning;
- subnet-zero warning;
- all-ones subnet warning;
- IPv6 prefix calculation without broadcast.

---

# Technical notes

The project uses only:

```text
HTML
CSS
Vanilla JavaScript
```

There is no backend, package manager, framework or data collection.

Open `index.html` in a modern browser or publish the folder through GitHub Pages.

---

# Historical/standards references

The subnet-zero/all-ones explanation is grounded in:

- RFC 950 — Internet Standard Subnetting Procedure;
- RFC 1878 — Variable Length Subnet Table for IPv4;
- RFC 3021 — Using 31-Bit Prefixes on IPv4 Point-to-Point Links;
- RFC 4291 — IPv6 Addressing Architecture.

The page deliberately distinguishes **historical recommendations** from current standards-based practice.

---

# Project structure

```text
cidr-visualizer/
├── index.html
├── style.css
├── app.js
├── README.md
└── LICENSE
```

# Author

**Alfredo San**  
Founder & Lead Developer

# License

MIT License

Copyright (c) 2026 Alfredo San
