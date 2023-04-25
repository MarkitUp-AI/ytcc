import { parse, GET, getTrack } from "./lib.js";
import fs from "fs";

// primitves
const WATCH_URL = "https://www.youtube.com/watch?v=fVW8-px4Ufw";

// get & parse
const text = await GET( WATCH_URL );
const json = text // THIS IS THE BIGGEST HACK. IT CAN BREAK ANYTIME
  .split( "ytInitialPlayerResponse =" )[ 1 ]
  .split( ";</script" )[ 0 ];

const transcript = await getTrack( json );

const parsed = parse( transcript );


// write to file
if ( typeof Bun !== 'undefined' )
  Bun.write( './dumps/video.txt', parsed );
else {
  // make sure dumps folder exists
  if ( !fs.existsSync( './dumps' ) ) fs.mkdirSync( './dumps' );

  fs.writeFileSync( './dumps/video.txt', parsed );
}