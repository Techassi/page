---
title: "VLANs - The easy way"
date: "2022-02-24T15:31:31+01:00"
author: "Techassi"
cover: ""
tags: ["vlan", "opnsense"]
keywords: ["", ""]
description: As a beginner it can be quite hard to find useful information on how to effectivly setup virtual networks.
  A few months back I struggled with these exact same issues. So can VLANs be hard? - Yes. Do they need to be? - 
  Probably not.
showFullContent: false
readingTime: true
---

## Introduction

If you ever encountered a vast amount of infrastructure, like a company or data centre network, they most likely use
VLANs to manage dataflow, client access and firewall rules. The usage of VLANs enables the network adminstrators to
easily create virtual networks across the deployed infrastruture, specify which subnet can talk to other subnets or even
which subnet is allowed to access the internet. But surely this is not only used in an enterprise enviroment, right? And
you would be correct to think that. More and more people deploy (server-grade) hardware at home to build out their own
infrastruture of servers, switches, network-attached storage and accommodating services like DHCP, DNS and monitoring.
With the growth of complexity and size of the network, many people choose to deploy VLANs at home. And here is were the
fun part starts - or not. As a beginner it can be quite hard to find useful information on how to effectivly setup
virtual networks. A few months back I struggled with these exact same issues. So can VLANs be hard? - Yes. Do they need
to be? - Probably not.

## What are VLANs

But before we dive into the setup of VLANs, we should probably explain what VLANs are and for what they are useful for.

## Which VLANs do I need?

With that out of the way we can start setting up out virtual networks. One of the first things I usually do is thinking
about what kind of VLANs I need. So in other words: What parts of my network need to separated from one another and
with how many VLANs do I end up?

First advice: Don't over do it. In my experience you can get away with ~ 5-10 VLANs in a home network. There is no need
to have 15+ VLANs at your home. A few general guidelines on how to separate the network are:

- **Services:** Let's assume you run some services in your home network, like DHCP, DNS, Git or Monitoring. It is a good
  idea to assign a VLAN to this part of the infrastructure. As this is usually the most important and critical part of a
  network I recommend going for a low VLAN ID, for example `10`. (Mention VLAN ID 1)
- **Storage:** The next most important part of a home network is usually some kind of network-attached storage (NAS for
  short). Most of the time there are multiple accommodating services like Plex, Radarr or Sonarr. These can also live
  in the storage VLAN. In my network I use ID `20`.
- **Trusted end-devices:** Commonly used end-devices like desktop PCs, laptops or smartphones live in this VLAN. Usually
  this subnet uses DHCP to dynamically assign IP addresses to distribute DNS server information. To give myself room for
  the future I usually use the "lower" IDs for management / infrastructure related devices. The "higher" IDs are used
  for end-devices. I use ID `100`.
- **Untrusted end-devices:** All device which are in some kind *untrusted* are assigned to this VLAN. These can
  include devices from your (potential) guest WiFi, IoT devices like smart thermostats or voice-assistant devices like
  Alexa. What kind of measurements you can take to protect trusted devices and your privacy are dicussed in a later part
  of this blog post. I use ID `110` and `120`.

These are what I consider the most *essential* VLANs you should setup. There are a few more interesting usecases for
additional VLANs. These include, but are not limited to:

- **Management:** Some devices have dedicated management interfaces (IPMI) which can be assigned to a dedicated
  management VLAN. I use ID `99`.
- **VPN:** There are many different reasons to setup a VPN tunnel between a client in the outside world (the internet)
  and you home network. Usually these tunnels are setup to access the internal network for management (when on vacation)
  or to access internal services like NAS devices. I use ID `200` for all icoming Wireguard connections.

## Choosing IP ranges

There are a few IP ranges dedicated to be used for private networks (such as home networks). The Internet Engineering
Task Force (IETF) describes 3 private address spaces in
[RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918#section-3). These are:

- `10.0.0.0/8`: 10.0.0.0 – 10.255.255.255
- `172.16.0.0/12`: 172.16.0.0 – 172.31.255.255
- `192.168.0.0/16`: 192.168.0.0 – 192.168.255.255

Most common routers provided by ISPs use either the `172` or `192.168` IP range. I always preferred the `10.0.0.0/8`
space as it provides the most addresses (16.777.216 to be exact) and is super easy to read. This range makes is also
extremly easy to assign subnets to the different VLANs. My recommendation is to use IP addresses with somehow refelect
the VLAN ID used by the subnet. Personally I use the following IP address spaces in my home network:

- **VLAN 10 (Services):** 10.10.0.0/24
- **VLAN 20 (Storage):** 10.20.0.0/24
- **VLAN 30 (Media):** 10.30.0.0/24
- **VLAN 40 (VOIP):** 10.40.0.0/24
- **VLAN 99 (Management):** 10.99.0.0/24
- **VLAN 100 (Trusted):** 10.100.0.0/24
- **VLAN 110 (Guests):** 10.110.0.0/24
- **VLAN 120 (IoT):** 10.120.0.0/24
- **VLAN 200 (Wireguard):** 10.200.0.0/24

A note: Some of the VLANs are rarely used or only contain a few devices. So these could theoretically be merged into
other VLANs. The gateway address is always `10.X.0.254`.

<!-- A few examples how the other private IP address spaces can be split up are:

**172.16.0.0/12**

- **VLAN 10:** 172.16.10.0/24
- **VLAN 99:** 172.16.99.0/24
- etc

**192.168.0.0/16**

- **VLAN 10:** 192.168.10.0/24
- **VLAN 99:** 192.168.99.0/24
- etc -->

## Choosing compatible hardware

<!-- There is nearly no network which operates without a single switch. A switch is one of the most important network
components besides the router, firewall and wireless access points (WAPs). -->

Today pretty much every device understands the concept of VLAN (See 802.1q). On the other hand most common entry-level
switches don't provide the required software to manage and configure VLANs on these devices. When on the hunt for new
switches always look out for the term **Managed**.