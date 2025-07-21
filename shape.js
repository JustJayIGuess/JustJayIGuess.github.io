class Shape {
    /**
     * Create an empty shape.
     */
    constructor() {
        this.points = [];
        this.closed = false;
    }

    /**
     * Add a point to the shape (to form a polygon).
     * Does nothing if shape is already closed.
     * @param {number} x x-coordinate of new point
     * @param {number} y x-coordinate of new point
     */
    add_point(x, y) {
        if (this.closed) return;
        this.points.push(createVector(x, y));
    }
    
    /**
     * Close the polygon
     */
    close() {
        this.closed = true;        
    }

    /**
     * Clear all points of the shape and reset state
     */
    reset() {
        this.points = [];
        this.closed = false;
    }

    static rotate_points_around(points, pivot, theta) {
        for (let i = 0; i < points.length; i++) {
            points[i].sub(pivot);
            points[i].rotate(theta);
            points[i].add(pivot);
        }
    }

    points_avg() {
        let x = 0;
        let y = 0;
        this.points.forEach(p => {
            x += p.x; y += p.y;
        });
        let n = this.points.length;
        return createVector(x/n, y/n);
    }

    rotate(pivot, theta) {
        Shape.rotate_points_around(this.points, pivot, theta);
    }

    /**
     * Draw the shape
     */
    draw() {
        stroke(palette.stroke);

        // Polygon
        fill(palette.fill)
        beginShape();
        this.points.forEach(p => {
            vertex(p.x, p.y);
        });
        if (this.closed) endShape(CLOSE);
        else endShape();
    
        // Vertices
        fill(this.closed ? palette.accent3 : palette.accent1);
        this.points.forEach(p => {
            circle(p.x, p.y, 10);
        });
    }

    /**
     * Intersect a ray with the shape
     * @param {*} rx The ray origin x
     * @param {*} ry The ray origin y
     * @param {*} rx2 The ray endpoint x
     * @param {*} ry2 The ray endpoint y
     * @returns An object with the list of the positions of intersections and exposure
     */
    intersect_ray(rx, ry, rx2, ry2) {
        if (!this.closed) return null;
        let intersections = [];

        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i+1) % this.points.length];

            let intersection = this.intersect_edges(rx, ry, rx2, ry2, p1.x, p1.y, p2.x, p2.y);

            if (intersection) intersections.push(intersection);
        }

        if (intersections.length % 2 == 1) return null;
        // even # of intersections if starting outside shape
        let exposure = 0;
        let distances = [];
        let origin = createVector(rx, ry);
        intersections.forEach(intersection => {
            distances.push(intersection.dist(origin));
        });            
        
        distances.sort((a,b) => a - b);
        for (let i = 0; i < distances.length; i += 2) {
            exposure += distances[i+1] - distances[i];
        }

        return { intersections: intersections, exposure: exposure };
    }

    // Snippet from Ahmad Moussa
    // https://www.gorillasun.de/blog/an-algorithm-for-polygon-intersections/
    // no need to reinvent the wheel
    intersect_edges(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }

        let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // Lines are parallel
        if (denominator === 0) {
            return false;
        }

        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }

        // Return a object with the x and y coordinates of the intersection
        let x = x1 + ua * (x2 - x1);
        let y = y1 + ua * (y2 - y1);

        return createVector(x, y);
    }


}