import convert from "xml-js";
import fs from "fs";

const GET = ( url ) => fetch( url ).then( ( res ) => res.text() );

// primitves
const WATCH_URL = "https://www.youtube.com/watch?v=fVW8-px4Ufw";

// GET & PARSE VIDEO
const text = await GET( WATCH_URL );
const json = text.split( "ytInitialPlayerResponse =" )[ 1 ].split( ";</script" )[ 0 ];

const meta = JSON.parse( json );

const tracks = meta.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

// GET CORRECT TRACKS
let track = tracks.find( ( track ) => track.languageCode === 'en-US' )
if ( !track ) track = tracks.find( ( track ) => track.languageCode === 'en' )
if ( !track ) throw new Error( 'No English Captions Found' )

const url = track.baseUrl;

// GET TRANSCRIPT
const transcript = await GET( url );

// PARSE TRANSCRIPT
// const jsonTranscript = xml2json( transcript.replaceAll( "\n", "" ) );
const jsonTranscript_text = convert.xml2json( transcript, { compact: true, spaces: 4 } );

// reduce size
const jsonTranscript = JSON.parse( jsonTranscript_text ).transcript.text;
const data = jsonTranscript.map( ( { _attributes: { start, dur }, _text } ) =>
  `${ start }+=${ dur } : ${ _text }` ).join( "\n" );

if ( typeof Bun !== 'undefined' )
  Bun.write( './dumps/video.txt', data );
else {
  // make sure dumps folder exists
  if ( !fs.existsSync( './dumps' ) ) fs.mkdirSync( './dumps' );

  fs.writeFileSync( './dumps/video.txt', data );
}