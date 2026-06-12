### Overview

Starts with i: get info

Starts with q: to be executed from another script

`traceserver.ts`: to figure out path to a server

### Start of game

1. Run `allservers.ts` to update `zserverinfo.json`.
1. Run `scanprocess.ts` to run `qoperate.ts` script on servers.

### Prepare a target server with a weak home

1. Find good hosts with `ihost.ts`
1. Find a good target with `itarget.ts`
1. Run `qoweakenloop.ts` from multiple hosts until minimum level
1. Run `distgrow.ts` from multiple hosts
