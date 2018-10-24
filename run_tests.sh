#!/bin/bash

runAttempts() {
  size=$1;
  cores=$2;

  attempt=1;

  while [ $attempt -le 10 ]
  do
    SIZE=$size CORES=$cores ATTEMPT=$attempt yarn test;

    ((attempt++));
  done;
}

runWithFixedSize() {
  size=$1;

  cores=1;

  while [ $cores -le 8 ]
  do
    runAttempts $size $cores;

    ((cores++));
  done;
}

runWithFixedSize 50;

counter=100;

while [ $counter -le 2500 ]
do
  runWithFixedSize $counter;

  ((counter+=100))
done
