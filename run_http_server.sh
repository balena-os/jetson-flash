#!/bin/bash

pushd /tmp/
python3 -m http.server 80 &
popd

bash
