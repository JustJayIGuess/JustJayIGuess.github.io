class Rays {
    static Mode = {
        SINGLE: 'Single',
        ARRAY: 'Array',
        SCAN: 'Scan',
        RECONSTRUCT: 'Reconstruct',
    }

    /**
     * Create a Rays object in mode.
     * @param {Rays.Mode} mode
     */
    constructor(mode, exposure, reconstruct_prog=0) {
        this.mode = mode;

        this.cast_from = null;
        this.cast_to = null;
        this.text_offset = createVector(5,-5);

        this.half_num = 200;
        this.width = 400;

        this.reconstruct_prog = reconstruct_prog;

        this.exposure = exposure;
    }

    draw(shape, sinogram=null, dtheta=null) {
        switch (this.mode) {
            case Rays.Mode.SINGLE:
                return this.draw_single(shape);
            case Rays.Mode.ARRAY:
                return this.draw_array(shape);
            case Rays.Mode.SCAN:
                this.cast_from = createVector(width/2, 0);
                this.cast_to = createVector(width/2, height);
                this.width = width;
                return this.draw_array(shape, true);
            case Rays.Mode.RECONSTRUCT:
                this.draw_reconstruct(sinogram, dtheta);
            default:
                break;
        }
    }

    // static highpass_sinogram(sinogram, nsmooth) {
    //     sinogram_lowpass = [];
    //     for (let i = 0; i < sinogram.length; i++) {
            
            
    //     }
    // }

    set_exposure(exposure) {
        this.exposure = exposure;
    }

    draw_reconstruct(sinogram, dtheta) {
        if (this.reconstruct_prog >= sinogram.length) return;

        let avg_sino_val = 0;
        let sino_val_count = 0;
        sinogram.forEach(frame => {
            frame.forEach(val => {
                avg_sino_val += val;
                sino_val_count++;
            });
        });
        avg_sino_val /= sino_val_count;

        let step = width/2 / (2 * rays.half_num + 1);
        const vals = sinogram[this.reconstruct_prog];

        push();
        translate(width/2, height/2);
        rotate(-dtheta*this.reconstruct_prog);    
        strokeWeight(0.5);
            
        for (let i = -this.half_num; i <= this.half_num; i++) {
            let n = i + this.half_num;
            stroke(this.exposure*vals[n]/avg_sino_val/sinogram.length);
            
            line(i*step, -width/2, i*step, width/2);
        }

        pop();

        this.reconstruct_prog++;
    }

    draw_single_ray(shape, from, to, only_inters=false) {
        noStroke();
        fill(palette.accent1);
        if (!only_inters) circle(from.x, from.y, 10);

        stroke(palette.accent1);
        if (!only_inters) line(from.x, from.y, to.x, to.y);
        noStroke();

        const result = shape.intersect_ray(
            from.x, from.y, to.x, to.y
        );
        if (result === null) return null;
        let {intersections, exposure} = result;
        
        intersections.forEach(p => {
            circle(p.x, p.y, 8);
        });

        if (this.mode === Rays.Mode.SINGLE) {
            const text_pos = from.copy().add(this.text_offset);
            text(exposure.toFixed(2), text_pos.x, text_pos.y);
        }
        
        return exposure;
    }

    /**
     * Draw a single ray intersecting a shape.
     * @param {Shape} shape The shape to intersect the ray with
     */
    draw_single(shape) {
        if (this.cast_from === null || this.cast_to === null) return null;

        return this.draw_single_ray(shape, this.cast_from, this.cast_to)
    }

    /**
     * Draw a single ray intersecting a shape.
     * @param {Shape} shape The shape to intersect the ray with
     */
    draw_array(shape, only_inters=false) {
        if (this.cast_from === null || this.cast_to === null) return null;

        let dir = p5.Vector.sub(this.cast_to, this.cast_from);
        let step = createVector(dir.y, -dir.x);
        step.normalize();
        step.mult(this.width / (this.half_num * 2 + 1));

        let exposures = [];
        for (let i = -this.half_num; i <= this.half_num; i++) {
            let origin = p5.Vector.mult(step, i);
            origin.add(this.cast_from);
            exposures.push(this.draw_single_ray(
                shape,
                origin,
                p5.Vector.add(origin, dir),
                only_inters
            ));
        }        

        return exposures;
    }

    /**
     * Set the ray origin
     * @param {number} x origin x-coord
     * @param {number} y origin y-coord
     */
    set_origin(x, y) {
        this.cast_from = createVector(x, y);
        this.cast_to = null;
    }

    /**
     * Set the ray endpoint
     * @param {number} x endpoint x-coord
     * @param {number} y endpoint y-coord
     */
    set_endpoint(x, y) {
        this.cast_to = createVector(x, y);
    }
}