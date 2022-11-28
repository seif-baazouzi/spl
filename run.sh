#!/bin/bash

deno run --allow-run --allow-write --allow-read --import-map=import_map.json src/main.ts examples/dump.spl
