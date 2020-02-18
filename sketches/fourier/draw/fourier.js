function dft(x) {
  const X = [];
  const N = x.length;
  for (let k = 0; k < N; k++) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n++) {
      const phi = (TWO_PI * k * n) / N;
      const c = new Complex(cos(phi), -sin(phi));
      sum.add(x[n].mult(c));
    }
    sum.re = sum.re / N;
    sum.im = sum.im / N;

    let freq = k;
    let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
    let phase = atan2(sum.im, sum.re);
    X[k] = { re: sum.re, im: sum.im, freq, amp, phase };
  }
  return X;
}

//Low frequencies DFT Odd
function dftOdd(x) {

  const X = [];
  const N = x.length;

  for (let k = -(N - 1) / 2; k <= (N - 1) / 2; k++) {
    let sum = new Complex(0, 0);
    for (let l = 0; l < N; l++) {
      const phi = k * 2 * PI * l / N;
      const c = new Complex(cos(phi), -sin(phi));
      sum.add(x[l].mult(c));
    }
    //Average
    sum.re = sum.re / N;
    sum.im = sum.im / N;

    let freq = k;
    let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
    let phase = atan2(sum.im, sum.re);
    X[k + (N - 1) / 2] = {
      re: sum.re,
      im: sum.im,
      freq,
      amp,
      phase
    };
  }
  return X;
}

//Low frequencies DFT Even
function dftEven(x) {

  const X = [];
  const N = x.length;

  for (let k = -N / 2; k <= (N - 1) / 2; k++) {
    let sum = new Complex(0, 0);
    for (let l = 0; l < N; l++) {
      const phi = k * 2 * PI * l / N;
      const c = new Complex(cos(phi), -sin(phi));
      sum.add(x[l].mult(c));
    }
    //Average
    sum.re = sum.re / N;
    sum.im = sum.im / N;

    let freq = k;
    let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
    let phase = atan2(sum.im, sum.re);
    X[k + N / 2] = {
      re: sum.re,
      im: sum.im,
      freq,
      amp,
      phase
    };
  }
  return X;
}
