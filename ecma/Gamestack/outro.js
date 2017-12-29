
//attach all 'context' variables from local Gamestack object to module.exports context

for(var x in Gamestack) {

    module.exports[x] = Gamestack[x];

}

//return the module.exports keyword

return module.exports;

}



