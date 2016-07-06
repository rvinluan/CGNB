function Screen(board) {
  this.listener = new KeyboardListener()
  this.board = board // Temporary
}

function KeyboardListener() {
  var listener = this
  listener.state = 0
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
    // Any alphanumeric key to search for programs
    var char = e.key; 
    if(/[a-zA-Z0-9]/.test(char) && char.length == 1 && char != " ") {
      currentBoard.power.newChar(char)
    }

    // Escape, backspace, or delete keys to reset
    if (e.keyCode == '8' || e.keyCode == '27' || e.keyCode == '46') {
      currentBoard.resetAll()
    }
}

KeyboardListener.prototype.changeState = function(state) {
  this.state = state
}

KeyboardListener.prototype.findPrograms = function(char) {
  
  var board = currentScreen.board;
  var matchedNodes = []
  var unmatchedNodes = []
  var unfocusedNodes = false

  board.nodes.forEach(function(node) {
    
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

// KeyboardListener.prototype.newChar = function(char) {
//   if (this.energy > 0) {
//     this.char = char
//     this.fade = 255
//     if (currentBoard.findPrograms(char)) {
//       this.charMatch = true
//       this.energy--
//       this.recharge = 0
//     } else {
//       this.charMatch = false
//     }
//   }
// }