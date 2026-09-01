# CIDR Visualizer

## Interactive IPv4 & IPv6 Prefix Explorer

**CIDR Visualizer** is an educational web application focused on one of the most important ideas in IP networking:

> **What does the number after `/` mean?**

The application makes the CIDR prefix visible and interactive so the user can change `/24`, `/25`, `/26`, `/64`, and other prefix lengths and immediately see how the boundary between the network prefix and the remaining address bits changes.

---

## Why is the `/` number used?

An IPv4 address contains **32 bits**. An IPv6 address contains **128 bits**.

The number after the slash is the **prefix length**.

For example:

```text
192.168.1.0/24
```

means that the first **24 bits** form the network prefix.

Therefore:

```text
32 − 24 = 8
```

IPv4 bits remain outside the network prefix.

The same idea applies to IPv6:

```text
2001:db8:1234:5678::1/64
```

means that the first **64 of the 128 bits** belong to the prefix.

The remaining IPv6 bits are not automatically assumed to have one universal purpose; common subnetting examples often discuss them as an interface identifier, but the exact addressing architecture can vary.

---

## Why does changing the prefix matter?

Compare:

```text
192.168.1.0/24
```

with:

```text
192.168.1.0/25
```

With `/24`:

```text
24 prefix bits
8 host bits

2^8 = 256 addresses
```

With `/25`:

```text
25 prefix bits
7 host bits

2^7 = 128 addresses
```

One additional prefix bit means one fewer host bit.

That is why the IPv4 block size is divided by two whenever the prefix increases by one.

---

## `/24`, `/25`, `/26` and the mask

CIDR notation is a compact representation of the prefix boundary.

```text
/24
11111111.11111111.11111111.00000000
255.255.255.0
```

```text
/25
11111111.11111111.11111111.10000000
255.255.255.128
```

```text
/26
11111111.11111111.11111111.11000000
255.255.255.192
```

The number after `/` tells us how many leading `1` bits are in the IPv4 mask.

---

## How do you calculate the prefix in binary?

An IPv4 octet contains eight binary positions:

```text
128  64  32  16  8  4  2  1
```

For example:

```text
11000000
```

means:

```text
128 + 64 = 192
```

Therefore:

```text
11000000₂ = 192₁₀
```

For `/26`, the last mask octet is:

```text
11000000
```

so:

```text
128 + 64 = 192
```

and:

```text
/26 = 255.255.255.192
```

---

## Decimal → binary

To convert:

```text
173
```

use the same powers:

```text
128 64 32 16 8 4 2 1
```

Select the largest value that fits and subtract:

```text
173 − 128 = 45
45 − 64  → does not fit
45 − 32  = 13
13 − 16  → does not fit
13 − 8   = 5
5 − 4     = 1
1 − 2     → does not fit
1 − 1     = 0
```

The resulting bits are:

```text
10101101
```

Therefore:

```text
173₁₀ = 10101101₂
```

---

## Binary → decimal

Start with:

```text
10101101
```

Map the `1` bits to their weights:

```text
128 64 32 16 8 4 2 1
 1  0  1  0 1 1 0 1
```

Then add the active weights:

```text
128 + 32 + 8 + 4 + 1 = 173
```

Therefore:

```text
10101101₂ = 173₁₀
```

---

# IPv4

IPv4 has 32 bits.

For a prefix `/n`:

```text
Network/prefix bits = n
Host bits = 32 − n
```

In the traditional subnetting model:

```text
Total addresses = 2^(host bits)

Usable hosts = 2^(host bits) − 2
```

The subtraction of two represents the traditional reservation of the Network Address and Broadcast Address.

Special prefixes such as `/31` and `/32` should be interpreted according to their actual use instead of blindly applying the traditional formula.

---

# IPv6

IPv6 has 128 bits.

For a prefix `/n`:

```text
Prefix bits = n
Remaining bits = 128 − n
```

The application deliberately does not apply the IPv4 “minus two” rule to IPv6 because IPv6 does not use broadcast in the same way.

Example:

```text
2001:db8:1234:5678::1/64
```

can be visualized as:

```text
PREFIX
<---------------- 64 bits ---------------->

REMAINDER
<---------------- 64 bits ---------------->
```

The page also shows how hexadecimal groups relate to binary:

```text
0000 = 0000000000000000
ffff = 1111111111111111
```

---

# Interactive sections

## APRENDER

Explains:

- what CIDR means;
- why the `/` number exists;
- how prefix bits and host bits are related;
- why increasing the prefix reduces the IPv4 block size;
- how CIDR relates to binary and decimal masks.

## EXPLORAR PREFIJO

A slider changes the prefix and updates the visualization in real time.

The page shows:

- prefix length;
- network bits;
- remaining bits;
- total IPv4 addresses;
- binary mask;
- decimal mask;
- bit-by-bit prefix boundary.

IPv4 and IPv6 can be selected independently.

## CONVERTIR

Interactive tools for:

```text
Decimal → Binary
Binary → Decimal
Prefix → Binary Mask → Decimal Mask
```

The binary weights remain visible so the learner can understand the calculation.

## SUBNETTING

Connects the prefix directly to the IPv4 subnetting process.

Example:

```text
192.168.1.130/26
```

becomes:

```text
Prefix: /26
Host bits: 6
Total addresses: 64
Mask: 255.255.255.192
Network: 192.168.1.128
Broadcast: 192.168.1.191
First host: 192.168.1.129
Last host: 192.168.1.190
```

---

# Learning chain

The main learning path is:

```text
PREFIX
   ↓
NUMBER OF PREFIX BITS
   ↓
REMAINING BITS
   ↓
BINARY MASK
   ↓
DECIMAL MASK
   ↓
BLOCK SIZE
   ↓
NETWORK
   ↓
BROADCAST
   ↓
HOST RANGE
```

The purpose is to understand the relationship instead of memorizing tables.

---

# Running locally

No framework or package installation is required.

Open:

```text
index.html
```

in a modern browser.

The project uses:

```text
HTML
CSS
Vanilla JavaScript
```

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

---

# Author

**Alfredo San**  
Founder & Lead Developer

---

# License

MIT License

Copyright (c) 2026 Alfredo San

See the `LICENSE` file for the complete license text.
