FROM alpine:latest

# Install bash
RUN apk add --no-cache bash

# Copy the script
COPY print-env.sh /print-env.sh
RUN chmod +x /print-env.sh

# Default command
CMD ["/print-env.sh"]
