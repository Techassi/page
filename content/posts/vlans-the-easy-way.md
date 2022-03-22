---
title: "VLANs - The easy way"
date: "2022-03-22T15:31:31+01:00"
author: "Techassi"
cover: ""
tags: ["vlan", "opnsense", "proxmox"]
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
which subnet is allowed to access the internet. But surely this is not only used in an enterprise environment, right?
And you would be correct to think that. More and more people deploy (server-grade) hardware at home to build out their
own infrastruture of servers, switches, network-attached storage and accommodating services like DHCP, DNS and
monitoring. With the growth of complexity and size of the network, many people choose to deploy VLANs at home. And here
is were the fun part starts - or not. As a beginner it can be quite hard to find useful information on how to effectivly
setup virtual networks. A few months back I struggled with these exact same issues. So can VLANs be hard? - Yes. Do they
need to be? - Probably not.

## What are VLANs?

But before we dive into the setup of VLANs, we should probably explain what VLANs are and for what they are useful for.
The easy way of explaining them is to say that they provide one or more **virtual** networks on top of a **single**
physical network. This allows users to separate networks on a virtual and not a physical level (which would require
multiple sets of cabling and network equipment).

"But how can we keep network traffic separated on a single network?" you may ask. This is achieved by tagging network
packets (usually on layer 2 in the OSI model) with unique IDs. Each ID marks traffic of one virtual network. The used
network equipment has to be able to understand these tags. See more about hardware selection in
[this](#choosing-compatible-hardware) section.

A core concept to understand is the VLAN mode the physical interface (port) operates in. A port can be **tagged** or
**untagged**:

- **Tagged:** If the port is set to `Tagged` only tagged packets can pass. This means, that only packets which are
  prepended by a VLAN Tag (ID) are allowed to continue. This mode is used to forward traffic to other network components
  which can correctly handle tagged traffic.
- **Untagged:** Most end devices (like PCs) don't understand tagged packets. Because of that every port which is
  configured as `Untagged` removes the VLAN tag before passing the packets through the port to the connected device. For
  incoming traffic the port does the opposite: Every packet is tagged with the unique VLAN ID. That's why these kind of
  ports are also called `Access Ports`.

## Which VLANs do I need?

With that out of the way we can start setting up out virtual networks. One of the first things I usually do is thinking
about what kind of VLANs I need. So in other words: What parts of my network need to separated from one another and
with how many VLANs do I end up?

First advice: Don't overdo it. In my experience you can get away with ~5-10 VLANs in a home network. There is no need
to have 15+ VLANs at your home. A few general guidelines on how to separate the network are:

- **Services:** Let's assume you run some services in your home network, like DHCP, DNS, Git or Monitoring. It is a good
  idea to assign a VLAN to this part of the infrastructure. As this is usually the most important and critical part of a
  network I recommend going for a low VLAN ID, for example `10`.
- **Storage:** The next most important part of a home network is usually some kind of network-attached storage (NAS for
  short). Most of the time there are multiple accommodating services like Plex, Radarr or Sonarr. These can also live
  in the storage VLAN. In my network I use ID `20`.
- **Trusted end-devices:** Commonly used end-devices like desktop PCs, laptops or smartphones live in this VLAN. Usually
  this subnet uses DHCP to dynamically assign IP addresses and distribute DNS server information. To give myself room
  for the future I usually use the "lower" IDs for management / infrastructure related devices. The "higher" IDs are
  used for end-devices. I use ID `100`.
- **Untrusted end-devices:** All devices which are in some kind *untrusted* are assigned to this VLAN. These can
  include devices from your (potential) guest WiFi, IoT devices like smart thermostats or voice-assistant devices like
  Alexa. I use ID `110` and `120`.

These are what I consider the most *essential* VLANs you should setup. There are a few more interesting usecases for
additional VLANs. These include, but are not limited to:

- **Management:** Some devices have dedicated management interfaces (IPMI) which can be assigned to a dedicated
  management VLAN. I use ID `99`.
- **VPN:** There are many different reasons to setup a VPN tunnel between a client in the outside world (the internet)
  and your home network. Usually these tunnels are setup to access the internal network for management (when on
  vacation) or to access internal services like NAS devices. I use ID `200` for all incoming Wireguard connections.

A note: Try to avoid VLAN ID `1`. This is the default VLAN. Using the default VLAN ID can get very messy for multiple
reasons. So without going into much detail: just start with ID `2` for example.

## Choosing IP ranges

There are a few IP ranges dedicated to be used for private networks (such as home networks). The Internet Engineering
Task Force (IETF) describes 3 private address spaces in
[RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918#section-3). These are:

- **10.0.0.0/8:** 10.0.0.0 – 10.255.255.255
- **172.16.0.0/12**: 172.16.0.0 – 172.31.255.255
- **192.168.0.0/16**: 192.168.0.0 – 192.168.255.255

Most common routers provided by ISPs use either the `172` or `192.168` IP range. I always preferred the `10.0.0.0/8`
space as it provides the most addresses (16.777.216 to be exact) and is super easy to read. This range makes is also
extremly easy to assign subnets to the different VLANs. My recommendation is to use IP addresses which somehow reflect
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

## Choosing compatible hardware

Today pretty much every device understands the concept of VLAN (See 802.1q). On the other hand most common entry-level
switches don't provide the required software to manage and configure VLANs on these devices. When on the hunt for new
switches always look out for the term **Managed**. I can personally recommend Mikrotik switches, as they are affordable
and have a great feature selection. As the time of writing I use the `CRS328-24P-4S+RM` as my core switch. For an
additional switch on the second floor I use the Netgear `GS116Ev2`.

The router (or firewall) is the next most important component which has to be compatible with VLANs, especially if you
want to use it as a router-on-a-stick. There are two methods on how to setup the VLANs and the routing between them,
also called inter-VLAN routing. Either your switches support VLAN routing (which means they have dedicated harware to
route VLAN-tagged packets) or your router does all the routing (Router-on-a-stick). Usually the second method is easier
to setup. I currently use OPNsense as my firewall which runs inside a VM managed by Proxmox. OPNsense pretty much runs
on every hardware, probably even on a toaster. The VM uses 4 virtualized cores and 4 GB of memory and has access to 2
physical RJ45 network interfaces which both support 10 GbE (Intel X550-AT2). One is used as the WAN interface and the
second one provides the virtual interfaces for all VLANs.

## Setting up VLANs

Let's finally dive into the setup. I use the router-on-a-stick method which means we have to setup the VLANs (and the
routing) on our firewall. In OPNsense this is straight forward:

### Creating VLAN interfaces in OPNsense

First navigate to `Interfaces > Other Types > VLAN`. A new VLAN can be added with the + button on the top right side. As
the parent interface you should select the LAN interface (e.g. `vtnet0`). The next 3 fields are pretty straight forward.
Choose the VLAN tag to use (see list above), the priority can be set to 0 (default) and the description should provide
information what the VLAN is used for. You can repeat this process for every VLAN you want to add.

After the virtual interfaces have been added we have to assign them. This can be done by navigating to
`Interfaces > Assignments`. To assign an interface provide a description and confirm with pressing the + button on the
right hand side.

After the assignment we can start the configuration of the interface. The interface appears on the left side under
`Interfaces` and is usually named `OPT<NUMBER>`. Start off by selecting and enabling it. Also change the description to
something like `VLAN<ID>`. Next we assign a static IPv4 address to the interface. I suggest using `10.<ID>.0.254/24`.

### Configure VLANs on your switches

Some switches support port-based and 801.2q based VLAN configurations. The 801.2q method is recommended. As a first step
the configured VLANs (from the previous step) need to be added on the switch as well. On Mikrotik devices running SwOS
this can be done under the `VLANs` tab. After adding all VLANs individual ports can be configured. There are two steps
involved: Setting the VLAN configuration for *outgoing* and *incoming* traffic. A few examples on how to configure ports
based on the desired usage:

- **Access Port:** Most of the time you want to configure a port as an `Access Port` which removes the prepended VLAN
  tag and passes the traffic down the wire to the connected end device. Access Ports are used if you want to connect
  devices like WAPs, PCs, TVs or security cameras.
- **Tagged Port:** A port with a single tagged VLAN only carries packets with the configured VLAN ID. This is used
  if the port connects to an additional network device (like a switch).
- **Trunk Port:** A trunk port can carry traffic with multiple VLAN IDs. Basically the port is a member of multiple
  VLANs. This mode is used to carry multiple VLANs across network devices.

Some switches require one additional configuration step. Higher end switches automatically tag incoming untagged traffic
with the configured VLAN ID on ports which are configured as `Untagged`. On mid end switches this behaviour needs to be
explicitly configured with the PVID (Port VLAN identifier). Just add the port as a member of the same VLAN. On Mikrotik
devices this can be done by checking the desired checkbox on the `VLANs` tab.

### How do I get devices into my new VLANs?

There primarily two methods to assign devices to VLANs: DHCP and static IP addresses. Lets explore these methods with a
few real world examples:

#### Assigning a VM to a VLAN in Proxmox

First we have to create a Bridge for our physical network interface. This enables us to use the same physical interface
with mutliple VMs. To do that we have to navigate to `Datacenter > YOUR_NODE > System > Network`. Let's create a
simple *Linux Bridge* with the name `vmbr<NUMBER>`. We don't assign an IP address or gateway. Enable Autostart and most
importantly the **VLAN aware** box has to be checked. Inside the *Bridge ports* field we add the name of our physical
interface we want to use. In the comment field we can enter a descriptive text, e.g. `VLAN Trunk`.

Next we can update the network settings of our VMs. Navigate to `Datacenter > YOUR_NODE > YOUR_VM > Hardware`. There
we can adjust the settings of the network device. First make sure we use the bridge we created beforehand. Add the VLAN
ID in the *VLAN Tag* field. Hit Okay and we are done. The VM now tags outgoing traffic with our selected VLAN ID and
removes the prepended ID for incoming traffic.

#### Adding a dedicated host to a VLAN with a static IP address

Adding a dedicated host to a VLAN with a static IP address is straight forward. On Debian this can be done by editing
the `/etc/network/interfaces` file:

```plain
# The primary network interface
allow-hotplug eth0
iface eth0 inet static
  address 10.10.0.1     # Static IP address
  netmask 255.255.255.0 # Netmask, here /24
  gateway 10.10.0.254   # Gateway IP address
```

Don't forget to mark the port on your switch which the host uses as `Untagged`. Otherwise the host cannot be reached /
is not assigned to the VLAN subnet.

#### Using DHCP to dynamically assign a host to a VLAN

Let's assume we have a VLAN for trusted (and maybe untrusted) devices which don't need a static IP address, for example
devices like desktop PCs, laptops and smartphones. For these kind of devices we can use a DHCP server to dynamically
assign IP addresses in the correct VLAN.

I personally use ISC Kea (the successor to ISC dhcpd). Setting up IP ranges which the server can use to assign is
straight forward. A stripped down configuration looks like this:

```json
{
  "Dhcp4": {
    "subnet4": [
      {
        "id": 100,
        "subnet": "10.100.0.0/24",
        "pools": [
          {
            "pool": "10.100.0.50 - 10.100.0.200"
          }
        ],
        "option-data": [
          {
            "name": "routers",
            "data": "10.100.0.254"
          }
        ],
        "comment": "VLAN 100 (Home) - Trusted"
      }
    ]
  }
}
```

ISC Kea will automatically assign IP addresses for devices with the VLAN ID `100` out of the configured pool
`10.100.0.50 - 10.100.0.200`. One additional thing to keep in mind is that if you use a central DHCP server you have to
relay DHCP packets to the server. In OPNsense this can be configured under `Services > DHCPv4 > Relay`. Make sure to
enable the relay, select the VLANs on which the packets should be relayed and enter the IP address of the central DHCP
server.

Speaking of relays: If you use Spotify Connect and you want to use it across VLANs you have to forward MDNS traffic.
This can be done by first installing the required plugin by navigating to `System > Firmware > Plugins` and to install
`os-mdns-repeater`. After that a new menu point MDNS Repeater under Services should appear. Enable it and select all
VLANs where traffic should be forwarded.

## Setting up firewall rules

The blog post isn't about firewall rules. But I still want to provide some basic examples how you can use firewall rules
in OPNsense to control data flow between VLANs. This proccess is called inter-VLAN routing.

## Conclusion

This is the end. You now should be equipped with the right knowledge to setup VLANs in your home network. If you have
feedback please contact me via e-mail or on Twitter.

Look out for an upcoming blog post about firewall rules and inter-VLAN routing!
