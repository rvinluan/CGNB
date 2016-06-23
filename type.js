// TODO: Fix bug that resets everything on an unmatched key
// TODO: Fix bug that starts the next program typing on the last letter
// TODO: Fix bug that doesn't remove the auto state on typing completion

var ProgramManager = {

  // Contains all existing programs
  programs: [],

  // Sequential IDs
  currentID: 0,
  getID: function() { return this.currentID++ },

  findPrograms: function(char) {
    
    var matchedPrograms = []

    $.each(ProgramManager.programs, function(i, program) {
      
      // If a program is both active and matches the character
      if (program.active && program.is_match(char)) {
        // Send it the character (received by program.receiveChar())
        ProgramManager.sendChar(char, program)
        matchedPrograms.push(program)
      
      } else {
        // Otherwise set it as inactive  
        program.setInactive()
      }

      // Update it on screen regardless (TODO: transfer this to Program functions)
      program.draw()
    
    })

    // If there's only one matched program, set it to autocomplete
    if (matchedPrograms.length == 1) {
      matchedPrograms[0].setAuto()
    }


    if (matchedPrograms.length == 0) { //TODO: figure out active program bug
      $.each(ProgramManager.programs, function(i, program) { program.reset() })
    }

  },

  sendChar: function(char, program) {
    program.receiveChar(char)
  },

  resetAll: function() {
    $.each(this.programs, function(i, program) {
      program.reset()
    })
  },

  runAuto: function() {
    $.each(this.programs, function(i, program) {
      if (program.auto) {
        program.run();
      }
    })
  }

}



$(function() {

// Placeholder, created the initial programs on the page
initPrograms()
function initPrograms() {
  var programs = ["create", "channel", "changer", "shield", "reach"]
  $.each(programs, function() {
    new Program(this)
  })
}


// Get keypress and pass to program
$(document).keypress(function(e){

  // Any alphanumeric key to search for programs
  var char = (String.fromCharCode(e.which)); 
  if(/[a-zA-Z0-9]/.test(char)) {
    ProgramManager.findPrograms(char)
  }
});

$(document).keydown(function(e) {

    // Return key to run current command and reset
    if (e.keyCode && e.keyCode == '13') {
      ProgramManager.runAuto()
      ProgramManager.resetAll()
    }

    // Escape, backspace, or delete keys to reset
    if (e.keyCode == '8' || e.keyCode == '27' || e.keyCode == '46') {
      ProgramManager.resetAll()
    }

});



// The Program object
function Program(command) {
  this.id = ProgramManager.getID() // Gets sequential ID from ProgramManager

  command = command.toString()
  this.command = command // Initial command
  this.untyped = command // Tracks what's already been typed (for next char)
  this.active = true // Tracks active state (inactive programs are ignored)
  this.auto = false // Tracks whether only active program for autocompletion & styling
  
  ProgramManager.programs.push(this) // Adds to set of programs on screen

  this.init() // Adds program to the DOM
}


// Adds the program to the DOM
Program.prototype.init = function() {
  var commandObject = '<p class="program" data-id="' + this.id + 
                                    '" data-command="' + this.command +
                                    '" data-auto="' + this.auto +
                                    '" data-active="' + this.active + '">' + 
                                    this.command + '</p>'
  this.object = $(commandObject).appendTo('body')
}

// Resets the program's typing status and redraws
Program.prototype.reset = function(char) {
  this.untyped = this.command
  this.active = true
  this.auto = false
  this.draw()
}

// Redraws the object in the DOM based on the current status
Program.prototype.draw = function() {
  this.object.attr('data-active', this.active)
  this.object.attr('data-auto', this.auto)
  var typed = this.command.substr(0, this.command.length - this.untyped.length)
  this.object.html("<span class='highlight'>" + typed + "</span>" + this.untyped)
  if (this.active == false) {
    this.object.html(this.untyped)
  }
}

// Sets the object to inactive and redraws
Program.prototype.setInactive = function() {
  this.active = false
  this.untyped = this.command
  this.draw()
}

// Sets the object to autocomplete and redraws
Program.prototype.setAuto = function(char) {
  this.auto = true
  this.draw()
}

// Checks if the next untyped character matches the argument
Program.prototype.is_match = function(char) {
  return (this.untyped.charAt(0) == char)
}

// Accepts a new character and removes the first untyped character, then redraws
Program.prototype.receiveChar = function(char) {
  if (this.untyped.charAt(0) == char) {
    this.untyped = this.untyped.substr(1)
  }
  this.draw()
  if (this.untyped.length == 0) {
    this.run()
  }
}

// Placeholder for running the program. Resets everything.
Program.prototype.run = function() {
  console.log("Running: '" + this.command + "'")
  ProgramManager.resetAll()
}

})

