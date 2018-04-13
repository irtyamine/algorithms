var chart = new ChartTracer();
var tracer = new Array1DTracer().chart(chart);
var logger = new LogTracer();
var D = Array1D.random(10);
tracer.set(D);


logger.print('Original array = [' + D.join(', ') + ']');

function heapSort(array, size) {
    var i, j, temp;

    for (i = Math.ceil(size / 2) - 1; i >= 0; i--) {
        heapify(array, size, i);
    }

    for (j = size - 1; j >= 0; j--) {
        temp = array[0];
        array[0] = array[j];
        array[j] = temp;
        
        tracer.notify(0, array[0]).notify(j, array[j]);
        logger.print('Swapping elements : ' + array[0] + ' & ' + array[j]).wait();
        tracer.denotify(0).denotify(j);
        tracer.select(j).wait();

        heapify(array, j, 0);

        tracer.deselect(j);
    }
}

function heapify(array, size, root) {

    var largest = root;
    var left = 2 * root + 1;
    var right = 2 * root + 2;
    var temp;

    if (left < size && array[left] > array[largest]) {
        largest = left;
    }

    if (right < size && array[right] > array[largest]) {
        largest = right;
    }

    if (largest != root) {
        temp = array[root];
        array[root] = array[largest];
        array[largest] = temp;

        tracer.notify(root, array[root]).notify(largest, array[largest]);
        logger.print('Swapping elements : ' + array[root] + ' & ' + array[largest]).wait();
        tracer.denotify(root).denotify(largest);

        heapify(array, size, largest);
    }
}

heapSort(D, D.length);

logger.print('Final array = [' + D.join(', ') + ']');