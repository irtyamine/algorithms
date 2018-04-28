const tracer = new Array2DTracer();
const logger = new LogTracer();
const n = 6; // rows (change these!)
const m = 6; // columns (change these!)

const h_end = m * 4 - (m - 1);
const v_end = n * 3 - (n - 1);

const G = [];

for (let i = 0; i < v_end; i++) { // by row
  G[i] = new Array(h_end);
  for (let j = 0; j < h_end; j++) { // by column
    G[i][j] = ' ';

    if (i === 0 && j === 0) { // top-left corner
      G[i][j] = '┌';
    } else if (i === 0 && j === h_end - 1) { // top-right corner
      G[i][j] = '┐';
    } else if (i === v_end - 1 && j === 0) { // bottom-left corner
      G[i][j] = '└';
    } else if (i === v_end - 1 && j === h_end - 1) { // bottom-right corner
      G[i][j] = '┘';
    } else if ((j % 3 === 0) && (i % v_end !== 0 && i !== v_end - 1 && i % 2 == 1)) {
      G[i][j] = '│';
    } else if (i % 2 === 0) {
      G[i][j] = '─';
    }

    if (m > 1) { // More than one column
      if (j % 3 === 0 && j !== 0 && j !== h_end - 1 && i === 0) {
        G[i][j] = '┬';
      }
      if (j % 3 === 0 && j !== 0 && j !== h_end - 1 && i === v_end - 1) {
        G[i][j] = '┴';
      }
    }

    if (n > 1) { // More than one row
      if (i % 2 === 0 && i !== 0 && i !== v_end - 1 && j === 0) {
        G[i][j] = '├';
      }
      if (i % 2 === 0 && i !== 0 && i !== v_end - 1 && j === h_end - 1) {
        G[i][j] = '┤';
      }
    }

    if (n > 1 && m > 1) { // More than one row and column
      if (i % 2 === 0 && j % 3 === 0 && i !== 0 && j !== 0 && i !== v_end - 1 && j !== h_end - 1) {
        G[i][j] = '┼';
      }
    }
  }
}

tracer.set(G);


function buildMaze() {
  const mySet = new disjoint_set();
  const width = m;
  const height = n;
  let setSize = 0;
  const graph = [];
  const visitedMap = {};
  const walls = {};
  var rightWalls = [];
  var downWalls = [];
  let location = 0;

  mySet.addElements(width * height);

  logger.print('initializing grid (all walls are up)');
  // init 'graph'
  // each room has two walls, a down and right wall.
  for (var i = 0; i < width; i++) {
    graph[i] = new Array(height);
    for (var j = 0; j < height; j++) {
      graph[i][j] = location;

      walls[location] = { down: true, right: true };
      visitedMap[location] = false;

      // If you can label the rooms with just 2 digits
      if (width * height < 100) {
        const location_string = location.toString();

        G[j * 2 + 1][i * 3 + 1] = location_string[0];
        G[j * 2 + 1][i * 3 + 2] = location_string[1];

        tracer.set(G);
      }

      rightWalls.push({ x: i, y: j });
      downWalls.push({ x: i, y: j });
      location++;
    }
  }

  logger.print('shuffled the walls for random selection');
  // Randomly shuffle the walls
  var rightWalls = shuffle(rightWalls);
  var downWalls = shuffle(downWalls);

  // Picking random walls to remove
  while (setSize != mySet.elements - 1) {
    const randomWall = Math.floor((Math.random() * 2) + 1);
    if (randomWall === 1 && downWalls.length > 0) {
      // Down wall
      var current_room = downWalls.pop();
      var i_x = current_room.x;
      var i_y = current_room.y;
      const i_y_down = i_y + 1;
      if (i_y_down < height) {
        var u = graph[i_x][i_y];
        var v = graph[i_x][i_y_down];
        tracer.notify(i_y * 2 + 1, i_x * 3 + 1);
        tracer.notify(i_y * 2 + 1, i_x * 3 + 2);
        tracer.notify(i_y_down * 2 + 1, i_x * 3 + 1);
        tracer.notify(i_y_down * 2 + 1, i_x * 3 + 2);
        if (mySet.find(u) != mySet.find(v)) {
          logger.print(`Rooms: ${u} & ${v} now belong to the same set, delete wall between them`);

          logger.wait();
          mySet.setUnion(u, v);
          setSize++;
          // delete wall
          walls[u].down = false;
        } else {
          logger.print(`Rooms: ${u} & ${v} would create a cycle! This is not good!`);
          logger.wait();
        }
      }
      tracer.clear();
    } else if (randomWall === 2 && rightWalls.length > 0) {
      // Right Wall
      var current_room = rightWalls.pop();
      var i_x = current_room.x;
      var i_y = current_room.y;
      const i_x_right = i_x + 1;
      if (i_x_right < width) {
        var u = graph[i_x][i_y];
        var v = graph[i_x_right][i_y];
        tracer.notify(i_y * 2 + 1, i_x * 3 + 1);
        tracer.notify(i_y * 2 + 1, i_x * 3 + 2);
        tracer.notify(i_y * 2 + 1, i_x_right * 3 + 1);
        tracer.notify(i_y * 2 + 1, i_x_right * 3 + 2);
        if (mySet.find(u) != mySet.find(v)) {
          logger.print(`Rooms: ${u} & ${v} now belong to the same set, delete wall between them`);

          logger.wait();
          mySet.setUnion(u, v);
          setSize++;
          // delete wall
          walls[u].right = false;
        } else {
          logger.print(`Rooms: ${u} & ${v} would create a cycle! This is not good!`);
          logger.wait();
        }
      }
      tracer.clear();
    }
  }

  tracer.clear();

  logger.print('deleting the walls');
  // update deleted walls
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      const current_wall = walls[graph[i][j]];

      if (current_wall.down === false) {
        G[j * 2 + 2][i * 3 + 1] = ' ';
        G[j * 2 + 2][i * 3 + 2] = ' ';
        tracer.select(j * 2 + 2, i * 3 + 1).wait();
        tracer.select(j * 2 + 2, i * 3 + 2).wait();
      }

      if (current_wall.right === false) {
        G[j * 2 + 1][i * 3 + 3] = ' ';
        tracer.select(j * 2 + 1, i * 3 + 3).wait();
      }
      tracer.set(G);
    }
  }
  logger.print('cleaning up the grid!');
  cleanUpGrid(width, height);

  // Clear out walls for the start and end locations.
  const random_start = Math.floor(Math.random() * width);
  const random_end = Math.floor(Math.random() * width);

  logger.print('setting the Start (S) & End (E) locations');

  // Start Location
  G[0][random_start * 3 + 1] = ' ';
  G[0][random_start * 3 + 2] = ' ';
  G[1][random_start * 3 + 1] = 'S';

  // End Location
  G[v_end - 1][random_end * 3 + 1] = ' ';
  G[v_end - 1][random_end * 3 + 2] = ' ';
  G[v_end - 2][random_end * 3 + 1] = 'E';

  cleanUpStartLocation(random_start);
  cleanUpEndLocation(random_end);

  logger.print('maze is completed!');

  // set the data
  tracer.set(G);
}
function cleanUpStartLocation(start) {
  if (G[0][start * 3] === '┬' && G[1][start * 3] === '│') {
    G[0][start * 3] = '┐';
  }
  if (G[0][start * 3 + 3] === '┬' && G[1][start * 3 + 3] === '│') {
    G[0][start * 3 + 3] = '┌';
  }
  if (G[0][start * 3] === '┌') {
    G[0][start * 3] = '│';
  }
  if (G[0][start * 3 + 3] === '┐') {
    G[0][start * 3 + 3] = '│';
  }
}

function cleanUpEndLocation(end) {
  if (G[v_end - 1][end * 3] === '┴' && G[v_end - 2][end * 3] === '│') {
    G[v_end - 1][end * 3] = '┘';
  }
  if (G[v_end - 1][end * 3 + 3] === '┴' && G[v_end - 2][end * 3 + 3] === '│') {
    G[v_end - 1][end * 3 + 3] = '└';
  }
  if (G[v_end - 1][end * 3] === '└') {
    G[v_end - 1][end * 3] = '│';
  }
  if (G[v_end - 1][end * 3 + 3] === '┘') {
    G[v_end - 1][end * 3 + 3] = '│';
  }
}

function cleanUpGrid(width, height) {
  // Remove room numbers
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      G[j * 2 + 1][i * 3 + 1] = ' ';
      G[j * 2 + 1][i * 3 + 2] = ' ';
    }
  }

  // clean up grid for looks
  for (var i = 0; i < v_end; i++) {
    for (var j = 0; j < h_end; j++) {
      if (G[i][j] === '├') {
        if (G[i][j + 1] === ' ') {
          G[i][j] = '│';
        }
      }

      if (G[i][j] === '┤') {
        if (G[i][j - 1] === ' ') {
          G[i][j] = '│';
        }
      }

      if (G[i][j] === '┬') {
        if (G[i + 1][j] === ' ') {
          G[i][j] = '─';
        }
      }

      if (G[i][j] === '┴') {
        if (G[i - 1][j] === ' ') {
          G[i][j] = '─';
        }
      }

      if (G[i][j] === '┼') {
        if (G[i][j + 1] === ' ' && G[i - 1][j] === ' ' && G[i][j - 1] !== ' ' && G[i + 1][j] !== ' ') {
          G[i][j] = '┐';
        } else if (G[i][j - 1] === ' ' && G[i - 1][j] === ' ' && G[i + 1][j] !== ' ' && G[i][j + 1] !== ' ') {
          G[i][j] = '┌';
        } else if (G[i][j - 1] === ' ' && G[i + 1][j] === ' ' && G[i - 1][j] !== ' ' && G[i][j + 1] !== ' ') {
          G[i][j] = '└';
        } else if (G[i][j + 1] === ' ' && G[i + 1][j] === ' ' && G[i - 1][j] !== ' ' && G[i][j - 1] !== ' ') {
          G[i][j] = '┘';
        } else if (G[i][j + 1] === ' ' && G[i][j - 1] === ' ' && (G[i + 1][j] === ' ' || G[i - 1][j] === ' ')) {
          G[i][j] = '│';
        } else if (G[i + 1][j] === ' ' && G[i - 1][j] === ' ' && (G[i][j - 1] === ' ' || G[i][j + 1] === ' ')) {
          G[i][j] = '─';
        } else if (G[i][j + 1] === ' ' && G[i][j - 1] === ' ') {
          G[i][j] = '│';
        } else if (G[i + 1][j] === ' ' && G[i - 1][j] === ' ') {
          G[i][j] = '─';
        } else if (G[i + 1][j] === ' ' && G[i - 1][j] !== ' ' && G[i][j - 1] !== ' ' && G[i][j + 1] !== ' ') {
          G[i][j] = '┴';
        } else if (G[i - 1][j] === ' ' && G[i + 1][j] !== ' ' && G[i][j + 1] !== ' ' && G[i][j - 1] !== ' ') {
          G[i][j] = '┬';
        } else if (G[i][j + 1] === ' ' && G[i - 1][j] !== ' ' && G[i + 1][j] !== ' ' && G[i][j - 1] !== ' ') {
          G[i][j] = '┤';
        } else if (G[i][j - 1] === ' ' && G[i - 1][j] !== ' ' && G[i + 1][j] !== ' ' && G[i][j + 1] !== ' ') {
          G[i][j] = '├';
        }
      }
    }
  }
}

class disjoint_set {
  constructor() {
    this.set = [];
    this.elements = 0;
  }
  addElements(numberOfElements) {
    for (let i = 0; i < numberOfElements; i++) {
      this.elements++;
      this.set.push(-1);
    }
  }
  find(element) {
    if (this.set[element] < 0) {
      return element;
    }
    return this.set[element] = this.find(this.set[element]);
  }
  setUnion(_a, _b) {
    const a = this.find(_a);
    const b = this.find(_b);

    if (a != b) {
      const newSize = (this.set[a] + this.set[b]);
      if (this.compareSize(a, b)) {
        this.set[b] = a;
        this.set[a] = newSize;
      } else {
        this.set[a] = b;
        this.set[b] = newSize;
      }
    }
  }
  compareSize(a, b) {
    if (this.set[a] === this.set[b]) {
    		return true;
    	} else if (this.set[a] < this.set[b]) {
    		return true;
    	}
    		return false;
  }
}

// http://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  let m = array.length,
    t,
    i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

buildMaze();
