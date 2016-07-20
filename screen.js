function Screen(board) {
  this.listener = new KeyboardListener()
  this.board = board // Temporary
  this.prompt = null
}

Screen.prototype.addPrompt = function(prompt) {
  this.prompt = prompt
  this.listener.state = 1
}

Screen.prototype.removePrompt = function() {
  this.prompt = null
  this.listener.state = 0
}

Screen.prototype.render = function() {
  this.board.render();
  if (this.prompt != null) {
    this.prompt.render();
  }
}

function KeyboardListener() {
  this.state = 0 
  /* 
  // Possible states:
  // 0: Program mode. Listening for Programs and Branches. 
  //    Sending sparks to programs. 
  //    Fading/highlighting letters on Program boxes.
  // 1: Prompt mode. Listening for a specific argument (Enemy/Wall/Branch/Program) based on the prompt.
  //    Adding letters to prompts.
  //    Highlighting letters on boxes that match type and characters.
  */

  // Get keypress and pass to function
  document.addEventListener('keydown', this.sendChar)
}

KeyboardListener.prototype.sendChar = function(e) {
    var listener = currentScreen.listener
    // Any alphanumeric key to search for programs / enemies
    var char = e.key;
    if(/[a-zA-Z0-9]/.test(char) && char.length == 1 && char != " ") {
      switch(listener.state) {
        case 0: 
          currentBoard.power.newChar(char); 
          break;
        case 1: 
          currentScreen.prompt.newChar(char); 
          break;
      }
    }

    // Escape, backspace, or delete keys to reset
    if (e.keyCode == '8' || e.keyCode == '27' || e.keyCode == '46') {
      switch(listener.state) {
        case 0: 
          currentBoard.resetAll();
          break;
        case 1: 
          if (e.keyCode == '27') {
            currentBoard.resetAll()
            currentScreen.removePrompt()
          } else if (e.keyCode == '8' || e.keyCode == '46') {
            currentScreen.prompt.clear()    
          }
          break;
      }
    }
}

KeyboardListener.prototype.changeState = function(state) {
  this.state = state
}

KeyboardListener.prototype.checkType = function(program) {
  if (currentScreen.listener.state == 0) {
    return program instanceof Program// || program instanceof NewAreaMarker
  } else {
    return program instanceof currentScreen.prompt.argumentType  
  }
}

KeyboardListener.prototype.findNodes = function(char) {
  
  var board = currentScreen.board;
  var matchedNodes = []
  var unmatchedNodes = []
  var unfocusedNodes = false

  board.nodes.filter(this.checkType).forEach(function(node) {
    
    if (!node.focused) { unfocusedNodes = true }
    // If a program is both focused and matches the character
    if (node.focused && node.is_match(char)) {
      matchedNodes.push(node)
    } else {
      unmatchedNodes.push(node)
    }

  })

  // If there's only one matched program, set it to autocomplete
  if (matchedNodes.length == 1) {
    matchedNodes[0].setAuto()
  }

  var finish = false;
  matchedNodes.forEach(function(node) {
    // Send it the character (received by program.receiveChar())
    if (board.power.typeChar(char, node)) {
      finish = true
    }
  })

  if (finish) {
    return
  }

  if (matchedNodes.length > 0) {
    unmatchedNodes.forEach(function(node) {
      // Otherwise set it as unfocused
      node.unFocus()
    })
    return true
  } else {
    return false
  }
}