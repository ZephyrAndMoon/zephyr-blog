let list = [2, 3, 13, 4, 8, 92, 120, 3, 1, 3, 4, 9, 5, 37];
function listMin() {
  var min = list[0];
  for (var i = 0; i < list.length; i++) {
    if (list[i] < min) {
      min = list[i];
    }
  }
  return min;
}

console.log(listMin());
