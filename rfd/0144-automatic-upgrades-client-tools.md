---
authors: Russell Jones (rjones@goteleport.com) and Bernard Kim (bernard@goteleport.com)
state: draft
---

# RFD 0144 - Automatic Upgrades for Client Tools

## Required Approvers

* Engineering: @sclevine && @bernardjkim && @r0mant
* Product: @klizhentas || @xinding33
* Security: @reedloden

## What

This RFD defines how support for automatic upgrades will be added to Teleport
client tools like `tsh` and `tctl`.

## Why

Automatic upgrades for client tools solves the following problems for users of
`tsh` and `tctl`.

* Security. For Teleport Cloud users, both `tsh` and `tctl` will always be
  running a release with no known security vulnerabilities. For self-hosted
  users, Teleport administrators will be able to quickly push out security
  vulnerability free releases to `tsh` and `tctl` users.
* Compatibility. Users will no longer have to learn about and understand
  [Component compatibility](https://goteleport.com/docs/upgrading/overview/#component-compatibility)
  rules when using Teleport client tools.
* Maintenance. Users will no longer have to perform manual maintenance
  operations (like updating packages) or configure system package managers to
  perform automatic updates to stay on the latest version of client tools.
  However, this will continue to be an option of the user decides.
* Cross-cluster compatibility. Users will no longer have to maintain multiple
  versions of client tools to access clusters running different versions of
  Teleport.
* Reduced download complexity. Users will always get releases of `tsh` and
  `tctl` with all features (like TouchID support) built-in.

## Details

### Use cases

Two main use cases will be supported.

* Users that want to install Teleport and not have to think about the version
  they are running. It's estimated 
* Users that want to pin client tools to a speicific version. This may be
  because client tools are being used in CI/CD infrastuctuer or device
  managment (like Jamf) tightly controls what version of software can be
  installed on a device.

### Implementation

#### Server Side changes

the ping endpoint will be updated to serve a client version.

the ping end point will be updatable via the following resource.

#### client side changes

Users will be able to do the initial install of client tools using whatever
mechanism they prefer (compile, tarball or packages or a package manager).

aiutomatic upgrades will kick in during login process. during login, teleport
will hit the above endpoint. if the version in the endpoint is strictly greater
than the version of the binary, teleport download the apprpriate tarball and
place it in `~/.tsh/bin`.

TODO(russjones): cache
TODO(russjones): .tsh/config
TODO(russjones): environment variables
TODO(russjones): full toolchain.
TODO(russjones): Metrics.

### User experience

```
$ tsh login --proxy=proxy.example.com

[...]

Your version of tsh is out of date.
Automatically update the version of tsh? [YES/no]

[continue login process]
```

If the user does not opt ito automatic updates:

```
$ tsh login --proxy=proxy.example.com

[...]

Your version of tsh is out of date.
Automatically update the version of tsh? [YES/no]

WARNING: Your version of tsh is out of date. Some functionality may not work.
Run "apt-get update teleport" to manually update your package or run
"tsh enroll-updates" to automatically keep your agent updated.

[attempt to login]
```

### Security

The initial version will rely on TLS to establish connection authenticity to
the Tlepeort download server.

Phase 2 will use The Upgrade Framework (TUF) to implement secure upgrades.

### Inspiration

https://go.dev/doc/toolchain
