#!/bin/bash

if [ "$NODE_ENV" = "circleci" ]; then
  echo "> Starting api server"
  cd ~/cache/opencollective-api
  PG_DATABASE=opencollective_dvl npm start &
  API_PID=$!
  cd -
  echo "> Starting frontend server"
  npm start &
  FRONTEND_PID=$!
fi
echo ""
echo "> Starting server jest tests"
jest test/server/*
RETURN_CODE=$?
if [ $RETURN_CODE -ne 0 ]; then
  echo "Error with jest tests, exiting"
  exit 1;
fi

echo ""
echo "> Ensure cypress binary is installed (should normally be cached)"
cypress install
echo "> Running cypress tests"
cypress run --record
RETURN_CODE=$?
if [ $RETURN_CODE -ne 0 ]; then
  echo "Error with cypress e2e tests, exiting"
  exit 1;
fi
echo ""

if [ "$NODE_ENV" = "circleci" ]; then
  echo "Killing all node processes"
  kill $API_PID;
  kill $FRONTEND_PID;
  echo "Exiting with code $RETURN_CODE"
  exit $RETURN_CODE
fi
