# lohifi

Use [Meilisearch](https://github.com/meilisearch/meilisearch) + [Next.js](https://github.com/vercel/next.js/) + [InstantSearch](https://github.com/algolia/instantsearch.js) to build a music search engine.



## Requirements

+ [NodeJs](https://nodejs.org/en/)
+ [Yarn](https://yarnpkg.com/getting-started/install)

## Setup

```bash
$ curl -L https://install.meilisearch.com | sh  # download and install meilisearch https://docs.meilisearch.com/learn/getting_started/quick_start.html#setup-and-installation
$ ./meilisearch  # launch meilisearch
```

```bash
$ yarn  # install dependencies
$ yarn setup  # create index and import documents from `assets/` folder into meilisearch
```

## Run

```bash
$ yarn dev
```

Go to [http://localhost:3000]( http://localhost:3000).

## Build

```bash
$ yarn build
$ yarn start
```

