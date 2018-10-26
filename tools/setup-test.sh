#!/usr/bin/bash

BASEDIR=$(dirname "$0")

for dir in $BASEDIR/../test/fixtures/packages/*
do
  cd $dir
  rm *.zip *.tgz || true
  npm pack
  zip -q0 *.tgz > atifacts.zip
  cd -
done

mkdir -p $BASEDIR/../tmp
