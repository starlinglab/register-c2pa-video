# C2PA Video Transcode and Registration Script
Register your video on Numbers and transcode them in Livepeer for web use. All authenticated with C2PA.

## Prerequisites

Before running this script, make sure you have the following:

- Node.js installed (version 18 or higher)
- A video file in a c2pa supported format (e.g., MP4, AVI, etc.)
- Rust (requirement of c2pa-node)

## Installation

```bash
yarn
```

yarn building steps might be slow due to c2pa-node building rust package

## Dependencies
* Latest version of rust
* Install [c2patool](https://github.com/contentauth/c2patool) with `cargo install c2patool`

## Usage

Run the script with the following command:

```bash
node index.js /path/to/video/file
```

Replace `/path/to/video/file` with the actual path to your video file.

This will register the video located at `/path/to/video/file` on the Numbers protocol. The video is then transcoded using Livepeer, transcoding result is also registered on Numbers.
