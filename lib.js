import convert from "xml-js";

export const GET = ( url ) => fetch( url ).then( ( res ) => res.text() );

export const parse = ( transcript ) => {
  const raw_text = convert.xml2json( transcript, {
    compact: true,
    spaces: 4
  } );

  // reduce size
  const json = JSON.parse( raw_text ).transcript.text;
  const data = json.map( ( { _attributes: { start, dur }, _text } ) =>
    `${ start }+=${ dur } : ${ _text }` ).join( "\n" );

  return data;
}

export const getTrack = async ( metadata, lang = "en-US" ) => {
  const meta = typeof metadata === 'string' ? JSON.parse( metadata ) : metadata;

  const tracks = meta.captions
    ?.playerCaptionsTracklistRenderer?.captionTracks || [];

  // GET CORRECT TRACKS
  let track = tracks.find( ( track ) => track.languageCode === lang );

  if ( !track )
    track = tracks.find( ( track ) => track.languageCode === 'en' );

  if ( !track )
    throw new Error( 'No English Captions Found' );


  // GET TRANSCRIPT
  const url = track.baseUrl;
  const transcript = await GET( url );

  return transcript;
}