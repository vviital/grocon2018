#!/bin/bash

run() {
  size=$1;

  cores=1;

  while [ $cores -le 8 ]
  do
    SIZE=$size CORES=$cores yarn test;

    ((cores++));
  done;
}

run 50;

counter=100;

while [ $counter -le 2500 ]
do
  run $counter;

  ((counter+=100))
done
