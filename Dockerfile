FROM denoland/deno:2.1.5

WORKDIR /app

COPY deno.jsonc deno.lock ./
COPY src ./src

USER deno

RUN deno cache src/mod.ts

ENTRYPOINT ["deno", "run", "--allow-net", "--allow-read","--allow-env" ,"src/mod.ts"]
