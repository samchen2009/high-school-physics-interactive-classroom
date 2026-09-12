const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function fitCanvas(canvas, aspect = 0.5) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.floor(width * aspect);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
}

function drawInduction() {
  const canvas = $('#inductionCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas);
  const sign = Number($('#sourceSign').value);
  const distance = Number($('#inductionDistance').value);
  const sourceX = width * (0.12 + (distance - 8) / 52 * 0.18);
  const conductorX = width * 0.62;
  const conductorY = height * 0.5;
  const conductorW = width * 0.52;
  const conductorH = Math.min(130, height * 0.48);
  const strength = 1 - (distance - 8) / 64;
  ctx.clearRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(sourceX, conductorY, 0, sourceX, conductorY, width * 0.24);
  glow.addColorStop(0, sign > 0 ? 'rgba(255,122,168,.26)' : 'rgba(109,229,255,.25)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#29435f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(conductorX - conductorW / 2, conductorY - conductorH / 2, conductorW, conductorH, conductorH / 2);
  ctx.fillStyle = 'rgba(18,41,66,.92)';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(sourceX, conductorY, 34, 0, Math.PI * 2);
  ctx.fillStyle = sign > 0 ? '#ff7aa8' : '#6de5ff';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#07111f';
  ctx.font = '800 28px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign > 0 ? '+' : '−', sourceX, conductorY - 1);

  const count = 18;
  const padding = 28;
  const left = conductorX - conductorW / 2 + padding;
  const right = conductorX + conductorW / 2 - padding;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const bias = (1 - t) * strength;
    const xNeg = left + (right - left) * Math.pow(t, 1 + strength * 1.8);
    const xPos = right - (right - left) * Math.pow(1 - t, 1 + strength * 1.8);
    const y = conductorY + (i % 3 - 1) * 28;
    const nearSign = -sign;
    drawCharge(ctx, nearSign > 0 ? xPos : xNeg, y, nearSign);
    drawCharge(ctx, nearSign > 0 ? xNeg : xPos, y + 14, -nearSign);
  }

  ctx.fillStyle = '#edf8ff';
  ctx.font = '700 15px system-ui';
  ctx.fillText('外部带电体', sourceX, conductorY + 62);
  ctx.fillText('原本中性的金属导体', conductorX, conductorY + conductorH / 2 + 34);
  ctx.fillStyle = '#9db3c8';
  ctx.font = '14px system-ui';
  ctx.fillText('近端聚集异种电荷', conductorX - conductorW * .25, conductorY - conductorH / 2 - 20);
  ctx.fillText('远端聚集同种电荷', conductorX + conductorW * .25, conductorY - conductorH / 2 - 20);

  $('#distanceValue').textContent = `${distance} cm`;
  $('#inductionReadout').textContent = `外物带${sign > 0 ? '正' : '负'}电 · 距离 ${distance} cm`;
}

function drawCharge(ctx, x, y, sign) {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = sign > 0 ? '#ff7aa8' : '#6de5ff';
  ctx.fill();
  ctx.fillStyle = '#07111f';
  ctx.font = '800 12px system-ui';
  ctx.fillText(sign > 0 ? '+' : '−', x, y);
}

function initCoulomb() {
  const q1 = $('#q1');
  const q2 = $('#q2');
  const r = $('#distanceR');
  if (!q1 || !q2 || !r) return;

  const grid = $('.grid', $('#forceChart'));
  const ns = 'http://www.w3.org/2000/svg';
  const left = 58, right = 496, top = 22, bottom = 284;
  for (let i = 0; i <= 5; i++) {
    const x = left + (right - left) * i / 5;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x); line.setAttribute('x2', x); line.setAttribute('y1', top); line.setAttribute('y2', bottom);
    grid.appendChild(line);
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', x); text.setAttribute('y', 302); text.setAttribute('text-anchor', 'middle'); text.textContent = i + 1;
    grid.appendChild(text);
  }
  for (let i = 0; i <= 4; i++) {
    const y = top + (bottom - top) * i / 4;
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', left); line.setAttribute('x2', right); line.setAttribute('y1', y); line.setAttribute('y2', y);
    grid.appendChild(line);
  }
  const sx = value => left + (value - 1) / 4 * (right - left);
  const sy = value => bottom - Math.min(1, value) * (bottom - top);
  let path = '';
  for (let value = 1; value <= 5.001; value += .04) path += `${path ? 'L' : 'M'}${sx(value).toFixed(1)},${sy(1 / (value * value)).toFixed(1)} `;
  $('#forceCurve').setAttribute('d', path);

  function update() {
    const a = Number(q1.value);
    const b = Number(q2.value);
    const distance = Number(r.value);
    const force = 0.009 * Math.abs(a * b) / (distance * distance);
    const relation = a === 0 || b === 0 ? '无静电力' : Math.sign(a) === Math.sign(b) ? '相互排斥' : '相互吸引';
    $('#q1Value').textContent = `${a >= 0 ? '+' : ''}${a} μC`;
    $('#q2Value').textContent = `${b >= 0 ? '+' : ''}${b} μC`;
    $('#rValue').textContent = `${distance.toFixed(1)} m`;
    $('#distanceTag').textContent = `${distance.toFixed(1)} m`;
    $('#forceReadout').textContent = `${force.toFixed(2)} N · ${relation}`;
    setOrb($('#orb1'), a);
    setOrb($('#orb2'), b);
    $('.distance-line').style.width = `${90 + distance * 30}px`;
    const arrowWidth = 10 + Math.min(70, force / 0.225 * 70);
    $('#leftArrow').style.width = `${arrowWidth}px`;
    $('#rightArrow').style.width = `${arrowWidth}px`;
    const attraction = relation === '相互吸引';
    $('#leftArrow').style.transform = attraction ? 'rotate(180deg)' : '';
    $('#rightArrow').style.transform = attraction ? 'rotate(180deg)' : '';

    const px = sx(distance);
    const relativeForce = 1 / (distance * distance);
    const py = sy(relativeForce);
    $('#forceGuide').setAttribute('x1', px); $('#forceGuide').setAttribute('x2', px);
    $('#forceGuide').setAttribute('y1', py); $('#forceGuide').setAttribute('y2', bottom);
    $('#forcePoint').setAttribute('cx', px); $('#forcePoint').setAttribute('cy', py);
    $('#forcePointLabel').setAttribute('x', Math.min(px + 12, 430));
    $('#forcePointLabel').setAttribute('y', Math.max(py - 10, 36));
    $('#forcePointLabel').textContent = `1/${distance.toFixed(1)}²`;
    $('#distanceMultiple').textContent = `${distance.toFixed(1)} 倍`;
    $('#forceFraction').textContent = `1/${(distance * distance).toFixed(2)}`;
  }
  function setOrb(orb, charge) {
    orb.className = `charge-orb ${charge > 0 ? 'positive' : charge < 0 ? 'negative' : 'neutral'}`;
    orb.textContent = charge > 0 ? '+' : charge < 0 ? '−' : '0';
  }
  [q1, q2, r].forEach(input => input.addEventListener('input', update));
  update();
}

function updateNav() {
  const sections = $$('[data-section]');
  const links = $$('.side-nav a');
  let active = sections[0]?.id;
  sections.forEach(section => { if (section.getBoundingClientRect().top < 180) active = section.id; });
  links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
}

const fieldState = { preset: 'dipole' };
function getFieldCharges(preset, width, height) {
  if (preset === 'single') return [{ x: width * .5, y: height * .5, q: 1 }];
  if (preset === 'same') return [{ x: width * .34, y: height * .5, q: 1 }, { x: width * .66, y: height * .5, q: 1 }];
  return [{ x: width * .34, y: height * .5, q: 1 }, { x: width * .66, y: height * .5, q: -1 }];
}

function fieldVector(x, y, charges) {
  let ex = 0, ey = 0;
  charges.forEach(charge => {
    const dx = x - charge.x;
    const dy = y - charge.y;
    const d2 = dx * dx + dy * dy;
    const d = Math.sqrt(d2);
    if (d > 8) {
      const scale = charge.q / (d2 * d);
      ex += dx * scale;
      ey += dy * scale;
    }
  });
  return { ex, ey, mag: Math.hypot(ex, ey) };
}

function drawVectorArrow(ctx, x, y, vx, vy, length, alpha) {
  const mag = Math.hypot(vx, vy) || 1;
  const ux = vx / mag, uy = vy / mag;
  const x2 = x + ux * length, y2 = y + uy * length;
  ctx.strokeStyle = `rgba(109,229,255,${alpha})`;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * 6 - uy * 4, y2 - uy * 6 + ux * 4);
  ctx.lineTo(x2 - ux * 6 + uy * 4, y2 - uy * 6 - ux * 4);
  ctx.closePath(); ctx.fill();
}

function drawField() {
  const canvas = $('#fieldCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .56);
  const charges = getFieldCharges(fieldState.preset, width, height);
  ctx.clearRect(0, 0, width, height);

  const step = width < 600 ? 42 : 48;
  for (let y = 34; y < height - 24; y += step) {
    for (let x = 30; x < width - 24; x += step) {
      const nearest = Math.min(...charges.map(c => Math.hypot(x - c.x, y - c.y)));
      if (nearest < 42) continue;
      const v = fieldVector(x, y, charges);
      const scaled = Math.min(1, Math.log10(1 + v.mag * width * width * 2.3));
      drawVectorArrow(ctx, x, y, v.ex, v.ey, 8 + scaled * 11, .3 + scaled * .65);
    }
  }

  charges.forEach(charge => {
    const glow = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, 64);
    glow.addColorStop(0, charge.q > 0 ? 'rgba(255,122,168,.42)' : 'rgba(109,229,255,.42)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(charge.x - 70, charge.y - 70, 140, 140);
    ctx.beginPath(); ctx.arc(charge.x, charge.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = charge.q > 0 ? '#ff7aa8' : '#6de5ff'; ctx.fill();
    ctx.fillStyle = '#07111f'; ctx.font = '900 24px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(charge.q > 0 ? '+' : '−', charge.x, charge.y - 1);
  });

  const probeX = width * .5, probeY = height * .5;
  const v = fieldVector(probeX, probeY, charges);
  if (v.mag > 1e-8 && charges.every(c => Math.hypot(probeX - c.x, probeY - c.y) > 35)) {
    drawVectorArrow(ctx, probeX, probeY, v.ex, v.ey, 45, 1);
    ctx.fillStyle = '#ffd166'; ctx.font = '700 14px system-ui'; ctx.fillText('E', probeX, probeY - 25);
  }
  const messages = {
    single: '单个正电荷 · 电场方向向外发散',
    dipole: '等量异号电荷 · 中点场强向右',
    same: '等量同号电荷 · 中点场强为零'
  };
  $('#fieldReadout').textContent = messages[fieldState.preset];
}

function initField() {
  $$('[data-field-preset]').forEach(button => {
    button.addEventListener('click', () => {
      fieldState.preset = button.dataset.fieldPreset;
      $$('[data-field-preset]').forEach(item => item.classList.toggle('active', item === button));
      drawField();
    });
  });
  drawField();
}

function drawPotential() {
  const canvas = $('#potentialCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .56);
  const image = ctx.createImageData(Math.floor(width), Math.floor(height));
  const charges = [{ x: width * .32, y: height * .5, q: 1 }, { x: width * .68, y: height * .5, q: -1 }];
  const pixels = image.data;
  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      let v = 0;
      charges.forEach(c => { v += c.q / Math.max(12, Math.hypot(px - c.x, py - c.y)); });
      const normalized = Math.max(-1, Math.min(1, v * width * .12));
      const band = Math.round(normalized * 12) / 12;
      const intensity = Math.min(1, Math.abs(band));
      const index = (py * Math.floor(width) + px) * 4;
      const base = [8, 20, 35];
      const target = band >= 0 ? [255, 122, 168] : [109, 229, 255];
      const mix = .08 + intensity * .42;
      pixels[index] = base[0] * (1 - mix) + target[0] * mix;
      pixels[index + 1] = base[1] * (1 - mix) + target[1] * mix;
      pixels[index + 2] = base[2] * (1 - mix) + target[2] * mix;
      pixels[index + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  ctx.strokeStyle = 'rgba(237,248,255,.13)'; ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath(); ctx.ellipse(charges[0].x, charges[0].y, i * 23, i * 15, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(charges[1].x, charges[1].y, i * 23, i * 15, 0, 0, Math.PI * 2); ctx.stroke();
  }
  charges.forEach(c => {
    ctx.beginPath(); ctx.arc(c.x, c.y, 23, 0, Math.PI * 2); ctx.fillStyle = c.q > 0 ? '#ff7aa8' : '#6de5ff'; ctx.fill();
    ctx.fillStyle = '#07111f'; ctx.font = '900 23px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y - 1);
  });

  const probePosition = Number($('#probeX').value) / 40;
  const probeX = width * (.5 + probePosition * .43);
  const probeY = height * .73;
  let potential = 0;
  charges.forEach(c => { potential += c.q / Math.max(14, Math.hypot(probeX - c.x, probeY - c.y)); });
  const displayV = potential * width * 6;
  ctx.strokeStyle = '#ffd166'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(probeX, 0); ctx.lineTo(probeX, height); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(probeX, probeY, 9, 0, Math.PI * 2); ctx.fillStyle = '#ffd166'; ctx.fill();
  ctx.fillStyle = '#edf8ff'; ctx.font = '700 14px system-ui'; ctx.fillText('探针', probeX, probeY + 25);
  const probeCharge = Number($('#probeSign').value);
  const energyTrend = displayV * probeCharge;
  $('#probeXValue').textContent = `${probePosition >= 0 ? '+' : ''}${(probePosition * 4).toFixed(1)} m`;
  $('#potentialReadout').textContent = `探针电势 ${displayV >= 0 ? '+' : ''}${displayV.toFixed(1)} kV · 电势能${energyTrend >= 0 ? '为正' : '为负'}`;
}

function initPotential() {
  $('#probeX')?.addEventListener('input', drawPotential);
  $('#probeSign')?.addEventListener('change', drawPotential);
  drawPotential();
}

let particlePhase = 0;
let particlePrevious = performance.now();
function drawParticle(now = performance.now()) {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .43);
  const sign = Number($('#particleSign').value);
  const speed = Number($('#particleSpeed').value);
  const voltage = Number($('#plateVoltage').value);
  const gap = Number($('#plateGap').value);
  const centerY = height * .5;
  const gapPx = height * (.34 + (gap - 12) / 16 * .28);
  const upper = centerY - gapPx / 2;
  const lower = centerY + gapPx / 2;
  const startX = width * .08;
  const endX = width * .92;
  const curvature = sign * voltage / (gap * speed * speed) * height * 1.8;
  const yAt = t => centerY + curvature * t * t;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,122,168,.16)'; ctx.fillRect(startX, upper - 15, endX - startX, 15);
  ctx.fillStyle = 'rgba(109,229,255,.16)'; ctx.fillRect(startX, lower, endX - startX, 15);
  ctx.strokeStyle = '#ff7aa8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(startX, upper); ctx.lineTo(endX, upper); ctx.stroke();
  ctx.strokeStyle = '#6de5ff'; ctx.beginPath(); ctx.moveTo(startX, lower); ctx.lineTo(endX, lower); ctx.stroke();
  ctx.fillStyle = '#ff7aa8'; ctx.font = '800 18px system-ui'; ctx.textAlign = 'left'; ctx.fillText('＋ ＋ ＋ ＋ ＋', startX, upper - 22);
  ctx.fillStyle = '#6de5ff'; ctx.fillText('−  −  −  −  −', startX, lower + 35);
  ctx.fillStyle = '#9db3c8'; ctx.font = '14px system-ui'; ctx.fillText('电场方向 ↓', endX - 90, centerY - 5);

  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath();
  let collided = false;
  let maxT = 1;
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const x = startX + (endX - startX) * t;
    const y = yAt(t);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    if (y <= upper || y >= lower) { collided = true; maxT = t; break; }
  }
  ctx.stroke(); ctx.setLineDash([]);
  const dt = Math.min(50, now - particlePrevious); particlePrevious = now;
  particlePhase = (particlePhase + dt * speed * .000055) % Math.max(.05, maxT);
  const px = startX + (endX - startX) * particlePhase;
  const py = yAt(particlePhase);
  ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fillStyle = sign > 0 ? '#ff7aa8' : '#6de5ff'; ctx.fill();
  ctx.fillStyle = '#07111f'; ctx.font = '900 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sign > 0 ? '+' : '−', px, py);
  ctx.textBaseline = 'alphabetic';

  $('#speedValue').textContent = speed.toFixed(1);
  $('#plateVoltageValue').textContent = `${voltage} V`;
  $('#plateGapValue').textContent = `${gap} cm`;
  $('#particleReadout').textContent = `${sign > 0 ? '正粒子向下' : '负粒子向上'}偏转 · ${collided ? '会撞板' : '不会撞板'}`;
  requestAnimationFrame(drawParticle);
}

function initParticle() {
  ['#particleSign', '#particleSpeed', '#plateVoltage', '#plateGap'].forEach(selector => {
    $(selector)?.addEventListener('input', () => { particlePhase = 0; });
  });
  requestAnimationFrame(drawParticle);
}

function drawCapacitor() {
  const canvas = $('#capacitorCanvas');
  if (!canvas) return;
  const { ctx, width, height } = fitCanvas(canvas, .57);
  const mode = $('#capacitorMode').value;
  const distance = Number($('#capDistance').value);
  const area = Number($('#capArea').value) / 100;
  const dielectric = Number($('#dielectric').value);
  const cRel = dielectric * area * 3 / distance;
  const uRel = mode === 'voltage' ? 1 : 1 / cRel;
  const qRel = mode === 'voltage' ? cRel : 1;
  const eRel = uRel * 3 / distance;
  const centerX = width * .5;
  const separation = width * (.16 + (distance - 1) / 5 * .28);
  const left = centerX - separation / 2;
  const right = centerX + separation / 2;
  const plateH = height * (.42 + area * .35);
  const top = (height - plateH) / 2;
  ctx.clearRect(0, 0, width, height);
  if (dielectric > 1) {
    ctx.fillStyle = `rgba(255,209,102,${.05 + dielectric * .025})`;
    ctx.fillRect(left + 8, top, right - left - 16, plateH);
    ctx.fillStyle = '#ffd166'; ctx.font = '700 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(`介质 εr=${dielectric.toFixed(1)}`, centerX, top + plateH / 2);
  }
  ctx.strokeStyle = '#ff7aa8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, top + plateH); ctx.stroke();
  ctx.strokeStyle = '#6de5ff'; ctx.beginPath(); ctx.moveTo(right, top); ctx.lineTo(right, top + plateH); ctx.stroke();
  const lines = Math.max(4, Math.round(5 + eRel * 5));
  ctx.strokeStyle = 'rgba(255,209,102,.56)'; ctx.lineWidth = 1.5;
  for (let i = 1; i <= lines; i++) {
    const y = top + plateH * i / (lines + 1);
    ctx.beginPath(); ctx.moveTo(left + 8, y); ctx.lineTo(right - 8, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(right - 17, y - 5); ctx.lineTo(right - 8, y); ctx.lineTo(right - 17, y + 5); ctx.stroke();
  }
  const charges = Math.max(3, Math.min(16, Math.round(qRel * 5)));
  ctx.font = '900 17px system-ui'; ctx.textBaseline = 'middle';
  for (let i = 0; i < charges; i++) {
    const y = top + 15 + (plateH - 30) * i / Math.max(1, charges - 1);
    ctx.fillStyle = '#ff7aa8'; ctx.textAlign = 'right'; ctx.fillText('+', left - 12, y);
    ctx.fillStyle = '#6de5ff'; ctx.textAlign = 'left'; ctx.fillText('−', right + 12, y);
  }
  ctx.fillStyle = '#edf8ff'; ctx.font = '700 14px system-ui'; ctx.textAlign = 'center';
  ctx.fillText(`板间距 ${distance.toFixed(1)} cm`, centerX, top + plateH + 34);
  ctx.fillStyle = '#9db3c8'; ctx.font = '13px system-ui';
  ctx.fillText(mode === 'voltage' ? '电源仍连接：电压被锁定' : '电源已断开：电荷量被锁定', centerX, top - 24);

  $('#capDistanceValue').textContent = `${distance.toFixed(1)} cm`;
  $('#capAreaValue').textContent = `${Math.round(area * 100)}%`;
  $('#dielectricValue').textContent = dielectric.toFixed(1);
  $('#capacitorReadout').textContent = mode === 'voltage' ? '接电源 · 电压保持不变' : '断开电源 · 电荷量保持不变';
  $('#capC').textContent = `${cRel.toFixed(2)} C₀`;
  $('#capQ').textContent = `${qRel.toFixed(2)} Q₀`;
  $('#capU').textContent = `${uRel.toFixed(2)} U₀`;
  $('#capE').textContent = `${eRel.toFixed(2)} E₀`;
  $('#capQHint').textContent = mode === 'voltage' ? '接电源时会随电容改变' : '断开电源后保持不变';
  $('#capUHint').textContent = mode === 'voltage' ? '由电源锁定' : '由电荷量和电容共同决定';
  $('#capCBar').style.width = `${Math.min(100, cRel / 15 * 100)}%`;
  $('#capQBar').style.width = `${Math.min(100, qRel / 15 * 100)}%`;
  $('#capUBar').style.width = `${Math.min(100, uRel / 5 * 100)}%`;
  $('#capEBar').style.width = `${Math.min(100, eRel / 3 * 100)}%`;
}

function initCapacitor() {
  ['#capacitorMode', '#capDistance', '#capArea', '#dielectric'].forEach(selector => {
    $(selector)?.addEventListener('input', drawCapacitor);
  });
  drawCapacitor();
}

$('#sourceSign')?.addEventListener('change', drawInduction);
$('#inductionDistance')?.addEventListener('input', drawInduction);
window.addEventListener('resize', drawInduction);
window.addEventListener('resize', drawField);
window.addEventListener('resize', drawPotential);
window.addEventListener('resize', drawCapacitor);
window.addEventListener('scroll', updateNav, { passive: true });
drawInduction();
initCoulomb();
initField();
initPotential();
initParticle();
initCapacitor();
updateNav();
