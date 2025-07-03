FROM alpine:latest

# Install bash
RUN apk add --no-cache bash

# Add script
COPY loop.sh /loop.sh
RUN chmod +x /loop.sh

CMD ["/loop.sh"]
