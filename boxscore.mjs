const R = '\x1b[0m'
const GRAY = '\x1b[2;37m'
const BOLD = '\x1b[1;97m'
const GREEN = '\x1b[1;32m'
const RED = '\x1b[1;31m'
const DIM_BORDER = '\x1b[2;37m'
const HEADER = '\x1b[1;33m'

const B = s => `${DIM_BORDER}${s}${R}`

function stat(n) {
  if (n === 0 || n === '0') return `${GRAY}${n}${R}`
  return `${BOLD}${n}${R}`
}

function avg(a) {
  const n = parseFloat(a)
  if (n >= 0.300) return `${GREEN}${a}${R}`
  if (n < 0.100) return `${RED}${a}${R}`
  if (n === 0) return `${GRAY}${a}${R}`
  return `${BOLD}${a}${R}`
}

function era(e) {
  const n = parseFloat(e)
  if (n === 0) return `${GRAY}${e}${R}`
  return `${BOLD}${e}${R}`
}

const W = 64

function border(l, m, r, fill = '═') {
  return B(l + fill.repeat(W - 2) + r)
}

function row(label, pos, ab, r, h, rbi, bb, so, a) {
  const lp = (label + ' ' + pos).padEnd(22)
  return B('║') + ` ${BOLD}${lp}${R}` +
    `  ${stat(ab)}  ${stat(r)}  ${stat(h)}  ${stat(rbi)}   ${stat(bb)}   ${stat(so)}   ${avg(a)}` +
    B('  ║')
}

function pitchRow(label, ip, h, r, er, bb, so, e) {
  const lp = label.padEnd(24)
  return B('║') + ` ${BOLD}${lp}${R}` +
    `  ${stat(ip)}  ${stat(h)}   ${stat(r)}   ${stat(er)}   ${stat(bb)}   ${stat(so)}  ${era(e)}` +
    B('  ║')
}

function header(title) {
  const pad = Math.floor((W - 2 - title.length) / 2)
  const left = pad
  const right = W - 2 - title.length - left
  return B('║') + ' '.repeat(left) + `${HEADER}${title}${R}` + ' '.repeat(right) + B('║')
}

function subheader(title) {
  return B('║') + `  ${BOLD}${title}${R}` + ' '.repeat(W - 4 - title.length) + B('║')
}

function colHeader(cols) {
  return B('║') + `  ${GRAY}${cols}${R}` + B('  ║')
}

function divider() {
  return B('╠' + '═'.repeat(W - 2) + '╣')
}

function totalRow(ab, r, h, rbi, bb, so) {
  const lp = 'TOTALS'.padEnd(22)
  return B('║') + `  ${GRAY}${lp}${R}` +
    `  ${BOLD}${ab}   ${r}   ${h}    ${rbi}   ${bb}  ${so}${R}` +
    '         ' + B('║')
}

function sep() {
  return B('║') + `  ${GRAY}${'─'.repeat(W - 6)}${R}` + B('  ║')
}

const lines = [
  border('╔', null, '╗'),
  header('MINNESOTA TWINS  @  KANSAS CITY ROYALS'),
  header('Kauffman Stadium  ·  April 2, 2026'),
  header('FINAL  ·  Att: 11,694'),
  divider(),
  subheader('LINESCORE'),
  colHeader('        1   2   3   4   5   6   7   8   9    R    H   E   '),
  B('║') + `  ${BOLD}MIN${R}     ${stat(0)}   ${stat(1)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(1)}   ${stat(3)}   ${BOLD} 5    8   1${R}   ` + B('║'),
  B('║') + `  ${BOLD}KC ${R}     ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(0)}   ${stat(1)}   ${stat(0)}   ${BOLD} 1    7   1${R}   ` + B('║'),
  divider(),
  subheader('MINNESOTA TWINS BATTING'),
  colHeader('Player                 Pos   AB   R   H  RBI   BB   SO   AVG'),
  row('Austin Martin',   'LF', 3, 0, 0, 0, 0, 2, '.000'),
  row('Byron Buxton',    'CF', 3, 0, 0, 1, 0, 1, '.000'),
  row('Luke Keaschall',  '2B', 4, 0, 2, 0, 0, 1, '.500'),
  row('Matt Wallner',    'RF', 4, 1, 1, 1, 0, 1, '.250'),
  row('Victor Caratini', ' C', 3, 0, 1, 0, 0, 0, '.333'),
  row('Kody Clemens',    '1B', 3, 2, 2, 1, 1, 0, '.667'),
  row('Josh Bell',       'DH', 3, 2, 1, 1, 1, 1, '.333'),
  row('Royce Lewis',     '3B', 4, 0, 1, 0, 0, 3, '.250'),
  row('Tristan Gray',    'SS', 4, 0, 0, 0, 0, 3, '.000'),
  sep(),
  totalRow(31, 5, 8, 4, 2, 12),
  divider(),
  subheader('MINNESOTA TWINS PITCHING'),
  colHeader('Pitcher                     IP    H    R   ER   BB   SO   ERA'),
  pitchRow('Taj Bradley (W)',      '6.0', 5, 0, 0, 1, 3, '0.87'),
  pitchRow('Justin Topa',          '1.0', 0, 0, 0, 1, 1, '2.45'),
  pitchRow('Cole Sands (H)',       '0.2', 2, 1, 1, 0, 0, '5.40'),
  pitchRow('Taylor Rogers (H)',    '0.1', 0, 0, 0, 0, 1, '0.00'),
  pitchRow('Kody Funderburk (H)', '1.0', 0, 0, 0, 0, 1, '4.91'),
  divider(),
  subheader('KANSAS CITY ROYALS BATTING'),
  colHeader('Player                 Pos   AB   R   H  RBI   BB   SO   AVG'),
  row('Whit Merrifield',  '2B', 3, 0, 0, 0, 0, 1, '.000'),
  row('Bobby Witt Jr.',   'SS', 4, 0, 1, 0, 0, 1, '.250'),
  row('Salvador Perez',   ' C', 4, 0, 1, 0, 0, 0, '.250'),
  row('Jonathan India',   '2B', 4, 0, 0, 0, 0, 0, '.000'),
  row('Isaac Collins',    'LF', 3, 0, 1, 0, 1, 1, '.333'),
  sep(),
  totalRow(33, 1, 7, 1, 2, 6),
  divider(),
  subheader('KANSAS CITY ROYALS PITCHING'),
  colHeader('Pitcher                     IP    H    R   ER   BB   SO   ERA'),
  pitchRow('Cole Ragans (L)',   '6.0', 4, 1, 0, 1, 8, '3.60'),
  pitchRow('Relief Staff',      '3.0', 4, 4, 4, 2, 4, '12.00'),
  border('╚', null, '╝'),
]

lines.forEach(l => console.log(l))
