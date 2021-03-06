// Extract requested file type
// Created for MIO server | www.MakeItOnce.net
// Author: Julius Gromyko | juliusgromyko@gmail.com
// Julius Gromyko (C) 2016

const path = require('path');
const o2x = require('object-to-xml');

// Extractor middleware
function extract(req, res, next){
  var pathExtension = path.extname(req.path).replace('.', '');
  var urlExtension = req.query.format;
  var headerExtensions = req.headers.format;
  var acceptsExtensions = req.accepts(['html', 'json', 'xml']);
  var contentType = req.headers['content-type'];
  if(contentType){
    contentType = contentType.split('/');
    contentType = contentType[contentType.length-1];
  }
  var extension = pathExtension || urlExtension || contentType || headerExtensions || acceptsExtensions;

  req.extension = extension;
  next();
}

// Response render
function render(req, res, options){
  // Return 501 error for unknown path
  if(!options){
    res.status(501);
    res.send('501 Not Implemented');
    return;
  }

  // Set status code
  if(options.status){
    res.status(options.status);
  }

  switch (req.extension) {
  // Send HTML View
  case 'html':
    if(options.template){
      res.type('html');
      res.render(options.template, options.data);
    }
    break;

    // Send JSON view
  case 'json':
    if(req.accepts('json')){
      res.type('json');
      res.json(options.data);
    }
    break;

  // Send XML view
  case 'xml':
    if(req.accepts('xml')){
      res.type('xml');
      res.send(o2x({
        '?xml version="1.0" encoding="utf-8"?' : null,
        xml: options.data
      }));
    }
    break;

  // Send error response
  default:
    res.type('text');
    if (typeof options.data == 'string' || options.data instanceof String){
      res.send(options.data);
    }else if(typeof options.data.message == 'string' || options.data.message instanceof String){
      res.send(options.data.message);
    }else{
      res.status(406);
      res.send('406 Not Acceptable');
    }
  }
}

module.exports = {
  extract: extract,
  render: render
};
