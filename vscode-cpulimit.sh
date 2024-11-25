#!/bin/bash
# Define the maximum CPU percentage you want to allow for all VSCode processes
MAX_CPU_USAGE=20
# Specify the log file location
LOG_FILE="/var/log/vscode-cpulimit.log"
while true; do
    # Find the PIDs of all VSCode processes (adjust the grep pattern if necessary)
    VSCODE_PIDS=$(ps aux | grep '[v]scode-server'| awk '{print $2}')
    # Check if any VSCode processes are running
    if [ -z "$VSCODE_PIDS" ]; then
        echo "[$(date)] No VSCode processes found." | tee -a $LOG_FILE
    else
        # Apply the CPU limit to each VSCode process
        for PID in $VSCODE_PIDS
        do
            cpulimit -p $PID -l $MAX_CPU_USAGE &
            echo "[$(date)] CPU limit of $MAX_CPU_USAGE% applied to VSCode process with PID: $PID" | tee -a $LOG_FILE
        done
    fi
    
    # Sleep for a specified amount of time before checking again
    sleep 5
done