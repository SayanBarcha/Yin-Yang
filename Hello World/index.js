import {
	Vector2,
	Clock,
	MathUtils
  } from "https://unpkg.com/three@0.157.0/build/three.module.js";
  console.clear();
  
  let unit = (n) => {
	return n * c.width * 0.005;
  };
  
  class Petal {
	constructor(params) {
	  this.angularSize = params.angularSize;
	  this.angularPos = params.angularPos;
	  this.angularSpeed = params.angularSpeed;
	  this.width = params.width;
	  this.borderThickiness = params.thickness;
	  this.border = params.border;
	  this.color = params.color;
  
	  this.distance = params.distance;
  
	  this.mediators = {
		v: new Vector2(),
		c: new Vector2()
	  };
	}
  
	draw($) {
	  let m = this.mediators;
	  let v = m.v;
	  let c = m.c;
	  //$.save();
	  $.lineWidth = this.borderThickness;
	  $.strokeStyle = this.border;
	  $.fillStyle = this.color;
	  $.lineCap = "round";
	  $.lineJoin = "round";
	  $.beginPath();
	  let du = unit(this.distance);
	  let rMax = Math.min(
		unit(90),
		Math.max(unit(50), du + unit(this.width) * 0.5)
	  );
	  let rMin = Math.min(
		unit(90),
		Math.max(unit(50), du - unit(this.width) * 0.5)
	  );
  
	  v.set(rMax, 0).rotateAround(c, -this.angularSize * 0.5 + this.angularPos);
	  //console.log(v);
	  $.moveTo(v.x, v.y);
	  $.arc(
		0,
		0,
		rMax,
		-this.angularSize * 0.5 + this.angularPos,
		this.angularSize * 0.5 + this.angularPos
	  );
	  $.arc(
		0,
		0,
		rMin,
		this.angularSize * 0.5 + this.angularPos,
		-this.angularSize * 0.5 + this.angularPos,
		true
	  );
	  $.lineTo(v.x, v.y);
  
	  $.fill();
	  $.stroke();
	  //$.restore();
	}
  }
  
  class Flower {
	constructor(amount) {
	  this.amount = amount;
	  this.petals = [];
	  this.petalsIndex = [];
	  this.init();
	}
	init() {
	  for (let i = 0; i < this.amount; i++) {
		let petal = new Petal({
		  angularSize: ((Math.random() * 0.5 + 0.5) * Math.PI) / 3,
		  angularPos: Math.random() * Math.PI * 2,
		  angularSpeed:
			(Math.random() * 0.5 + 0.5) *
			Math.sign(Math.random() - 0.5) *
			Math.PI *
			0.1,
		  width: (Math.random() * 0.5 + 0.5) * 20,
		  borderThickiness: unit(1),
		  border: "#f00",
		  color: Math.random() < 0.5 ? "#faa" : "#f44",
		  distance: Math.random() * 87
		});
		this.petals.push(petal);
		this.petalsIndex.push(i);
	  }
	}
	update($, t) {
	  this.petalsIndex.forEach((idx) => {
		let petal = this.petals[idx];
		petal.distance = (petal.distance + t * 20) % 100;
		petal.angularPos += petal.angularSpeed * t;
		petal.draw($);
	  });
	}
  }
  
  class Display {
	constructor() {
	  this.size = 64;
	  this.elements = [];
	  this.elementsInits = [];
  
	  this.elementRadius = 1.5;
	  this.thickness = 0.5;
	  this.border = "#f44";
	  this.color = "#fed";
  
	  this.init();
  
	  this.mediators = {
		d: new Vector2(),
		v: new Vector2(),
		c: new Vector2()
	  };
	}
	init() {
	  this.elements = new Array(this.size).fill().map(() => {
		return new Array(this.size).fill(1); //.map(n => Math.random() < 0.5 ? 0 : 1);
	  });
	  this.elementsInits = new Array(this.size).fill().map(() => {
		return new Array(this.size).fill().map(() => {
		  return {
			radiusFactor: Math.random(),
			radiusSpeed: Math.random() * 0.1 + 0.1
		  };
		});
	  });
	}
  
	draw($, t) {
	  let m = this.mediators;
	  let d = m.d;
	  let v = m.v;
	  let c = m.c;
	  let initX = -(this.size - 1) * 0.5;
	  let initY = -(this.size - 1) * 0.5;
	  $.save();
	  $.lineWidth = unit(this.thickness);
	  $.fillStyle = this.color;
	  $.strokeStyle = this.border;
	  $.beginPath();
	  let eis = this.elementsInits;
	  for (let row = 0; row < this.size; row++) {
		for (let col = 0; col < this.size; col++) {
		  let x = initX + col;
		  let y = initY + row;
		  v.set(x, y);
  
		  let ei = eis[row][col];
		  let rFactor = Math.abs(
			Math.sin((ei.radiusFactor + ei.radiusSpeed * t) * Math.PI * 2)
		  );
		  let r = this.elementRadius * (1 - v.length() / this.size) * rFactor;
  
		  yy(col, row, this.size, d, c, t); //yin-yang
		  r *= d.x;
  
		  if (d.y < 1) {
			v.multiplyScalar(unit((68 / this.size) * 1.5 ** 1));
			$.moveTo(v.x + unit(r), v.y);
			$.arc(v.x, v.y, unit(r), 0, Math.PI * 2);
		  }
		}
	  }
	  $.stroke();
	  $.fill();
  
	  $.restore();
  
	  // https://www.shadertoy.com/view/ldX3Rr
	  function yy(x, y, size, v, cnt, t) {
		v.set(x, y)
		  .divideScalar(size - 1)
		  .subScalar(0.5)
		  .multiplyScalar(2);
		v.rotateAround(cnt, -t * Math.PI * 2 * 0.1);
  
		let a = v.dot(v);
		let b = Math.abs(v.y) - a;
		let c = b > 0.0 ? v.y : v.x;
		let d = (a - 1.0) * (b - 0.23) * c;
  
		let r = a > 1.0 ? 0.5 : d > 0.0 ? 1.0 : 0.25;
		v.x = r; // value
		v.y = a; // distance
	  }
	}
  }
  
  let c = cnv;
  let center = new Vector2();
  let $ = c.getContext("2d");
  resize();
  window.addEventListener("resize", (event) => {
	resize();
  });
  function resize() {
	c.width = c.height = innerHeight * 0.975;
	c.style.borderRadius = `${unit(75)}px`;
	center.setScalar(c.height * 0.5);
  }
  
  let flower = new Flower(100);
  let display = new Display();
  
  let clock = new Clock();
  let t = 0;
  
  draw();
  
  function draw() {
	requestAnimationFrame(draw);
  
	let dt = clock.getDelta();
	t += dt;
  
	$.fillStyle = "#400";
	$.fillRect(0, 0, c.width, c.height);
  
	$.save();
	$.translate(center.x, center.y);
	// main disc
	$.lineWidth = unit(1);
	$.strokeStyle = "#f00";
	$.fillStyle = "#800";
	$.beginPath();
	$.arc(0, 0, unit(80), 0, Math.PI * 2);
	$.fill();
	$.stroke();
	// petals
	flower.update($, dt);
	display.draw($, t);
	$.restore();
  }
  