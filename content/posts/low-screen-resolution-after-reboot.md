---
title: "Low screen resolution after reboot"
date: 2026-04-03T19:31:29+02:00
author: "Techassi"
tags: ["linux", "gpu driver", "nvidia", "dkms"]
description: |
  Sometimes your system decides to be stuck at a super low screen resolution. These tips hopefully
  help you to troubleshoot and fix such issues.
draft: false
---

Sometimes your system decides to be stuck at a super low screen resolution (usually also only on a
single monitor), for example 1024 x 764. These tricks should help to resolve these kind of issues
(at least they got me out of a pickle twice already).

## Tips which saved my butt in the past

1. Make sure the correct GPU drivers are installed. For example, the NVIDIA GTX 970 graphics card
   only supports the `nvidia-580xx-dkms` drivers. The latest driver shipped by default on Arch (and
   possibly other distributions) is too new and will result in a low resolution after the system was
   updated and rebooted. Checking `dmesg` after the reboot helps to spot any driver-related
   messages/errors. So check if the currently installed driver supports your graphics card.
2. Add `nvidia_drm.modeset=1` to the boot options by appending it to the `GRUB_CMDLINE_LINUX_DEFAULT`
   parameter in `/etc/default/grub`. Then proceed to re-generate GRUB's live boot config by executing

   ```shell
   grub-mkconfig -o /boot/grub/grub.cfg
   ```

   This one was really hard to spot, because the switch to a low resolution was silent after a
   system update reboot. All utilities I ran basically reported that everything was fine. The list
   below mentions a few useful tools - even though they didn't help me in this case.
3. Try to install a newer kernel, but that could also potentially backfire. Try other potential
   fixes first, before resorting to this.

## Generally useful tools to know in these situations

- `nvidia-smi` prints out information about the installed graphics card and driver.
- `inxi -Fzxx` prints out various system-level information.
- `xrandr` prints out information about monitors, their resolution and refresh rate.
- `dkms status` prints out the status of kernel modules, which the driver is one of.
- `nvidia-settings` launches the NVIDIA settings application, but this will display fairly limited
  information when you run into GPU (driver) related issues.
- The internet and their Linux-focused forums, like the Arch forum and wiki, the Manjaro forum, or
  other forums for various other distributions (like Debian, Ubuntu, CachyOS, EndeavourOS).