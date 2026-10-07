/* =============================================================================
 *  电子变电站主接线 —— 静态模型层
 *  · 几何常量（母线 / 间隔 / 主变坐标）
 *  · 间隔数据（220kV / 110kV / 35kV）
 *  · 拓扑构建（导线 + 设备开关）
 *  · 设备注册表（含别名索引，供操作票 JSON 解析使用）
 *  · 带电计算（广度优先搜索）
 *  该文件不依赖 Vue / Canvas，可独立单测。
 * ========================================================================== */

export type Voltage = 220 | 110 | 35
export type BayKind = 'line' | 'ml' | 'zb'
export type SwitchKind = 'v-switch' | 'h-switch' | 'v-breaker' | 'h-breaker'
export type DeviceRole = 'breaker' | 'disconnector' | 'ground'

export interface Bay {
  id: string
  voltage: Voltage
  kind: BayKind
  x: number
  name: string
  qf: boolean
  zm: boolean
  fm: boolean
  xl: boolean
  gnd: boolean
  gnd2?: boolean
  gnd3?: boolean
}

export interface WireSeg {
  a: string
  b: string
  points: Array<[number, number]>
}

export interface DeviceDef {
  /** 唯一编号，例如 b220_0-qf */
  id: string
  /** 中文全称，例如 220kV 出线 1 断路器 */
  label: string
  kind: SwitchKind
  role: DeviceRole
  voltage: Voltage
  /** 所属间隔 id（母线分段 / 压变等使用自身 id） */
  bayId: string
  /** 命中测试包围盒（世界坐标，中心点 + 尺寸） */
  x: number
  y: number
  w: number
  h: number
  /** 该设备连接的拓扑节点 */
  nodeA: string
  nodeB: string
  get: () => boolean
  set: (v: boolean) => void
}

export interface SourceDef {
  id: string
  label: string
  voltage: Voltage
  x: number
  termY: number
}

export interface StationModel {
  bays: Bay[]
  bays220: Bay[]
  bays110: Bay[]
  bays35: Bay[]
  wires: WireSeg[]
  devices: DeviceDef[]
  deviceMap: Map<string, DeviceDef>
  aliasMap: Map<string, DeviceDef>
  /** 存在歧义（同名多设备）的别名，解析时直接判定失败 */
  ambiguousAliases: Set<string>
  sources: SourceDef[]
}

/* =============================== 几何常量 ================================ */

export const GEOM = {
  220: {
    bus1Y: 0, bus2Y: 300,
    bus1X0: -340, bus1X1: 2000,
    bus2X0: -340, bus2X1: 2000,
    zmTop: 120, zmH: 70,
    fmTop: 360, fmH: 70,
    xlTop: 680,xlH: 70,
    node: 480,
    qfTop: 540, qfH: 60,
    gnd: 780,
    gndMx: 380,
    gndXlc: 660,
    term: 920,
    dx: 100
  },
  110: {
    bus1Y: 1400, bus2Y: 1700,
    bus1X0: -340, bus1X1: 1800,
    bus2X0: -340, bus2X1: 1800,
    zmTop: 1520, zmH: 60,
    fmTop: 1760, fmH: 60,
    xlTop: 2030,xlH: 60,
    node: 1870,
    qfTop: 1920, qfH: 50,
    gnd: 2130,
    gndMx: 1770,
    gndXlc: 2000,
    term: 2280,
    dx: 80
  },
  35: {
    busY: 1400,
    busX0: -340 + 2500, busX1: 1800 + 2500,
    zmTop: 1520,zmH: 60,
    qfTop: 1760, qfH: 50,
    xlTop: 1920,xlH: 60,
    gndMx: 1710-100,
    gndXlc: 1860,
    gnd: 2030,
    term: 2280,
    dx: 80
  }
} as const

/** 220kV 母线分段 */
export const SEG_X = 720
export const SEG_Y = 80
export const SEG_DISC_OFFSET = 95
export const SEG_DISC_W = 62
export const SEG_BUS_LEFT_END = SEG_X - 160
export const SEG_BUS_RIGHT_START = SEG_X + 160

/** 220kV 母线压变 */
export const PT_X = -180
export const PT_Y = 90
export const PT_R = 18
export const PT_DISC_TOP = 10
export const PT_DISC_H = 60

/** 35kV 母线分段 */
export const SEG35_X = 720 + 2500
export const SEG35_DISC_OFFSET = 80
export const SEG35_DISC_W = 54
export const SEG35_BUS_LEFT_END = SEG35_X - 90
export const SEG35_BUS_RIGHT_START = SEG35_X + 90

/** 三绕组主变 */
export const TR_X = 1680
export const TR_Y = 940
export const TR_R = 30
export const TR_H_CENTER = { x: TR_X, y: TR_Y }
export const TR_M_CENTER = { x: TR_X - 45, y: TR_Y + 26 }
export const TR_L_CENTER = { x: TR_X, y: TR_Y + 52 }

/** 110kV 主变间隔（反向：主变在上，母线在下） */
export const TR110_X = 1560
export const TR110_TERM_Y = 966
export const TR110_GND_Y = 1080
export const TR110_QF_Y = 1150
export const TR110_QF_H = 50
export const TR110_NODE_Y = 1230
export const TR110_ZM_Y = 1300
export const TR110_ZM_H = 55
export const TR110_FM_X = 1640
export const TR110_FM_Y = 1550
export const TR110_FM_H = 55

/** 35kV 主变间隔（从主变向下到 35kV 母线） */
export const TR35_X = 1680 + 600
export const TR35_TERM_Y = 1022 + 25
export const TR35_QF_Y = 1150
export const TR35_QF_H = 50
export const TR35_GND_Y = 1080

/** 世界包围盒 */
export const WORLD_X0 = -400
export const WORLD_X1 = 2100
export const WORLD_Y0 = -160
export const WORLD_Y1 = 3100

export const MIN_SCALE = 0.12
export const MAX_SCALE = 6

/** 新版配色（深空蓝 + 荧光绿 / 琥珀色） */
export const COLOR = {
  wire: '#8fb6d6',
  wireDim: '#3d5b76',
  bus220: '#38a9f0',
  bus110: '#2fd6a8',
  bus35: '#a982f5',
  closed: '#3ddc97',
  open: '#ff5f6d',
  ground: '#ffa94d',
  label: '#8aa7c0',
  labelStrong: '#dbeafe',
  transformer: '#ffa94d',
  hover: '#5fd0ff',
  active: '#ffd166',
  live: '#25f0a5',
  done: '#3ddc97'
}

/* =============================== 间隔数据 ================================ */

const BAY_220: Array<Omit<Bay, 'voltage'>> = [
  { id: 'b220_0', kind: 'line', x: 0, name: '220kV 出线 1', qf: true, zm: false, fm: true, gnd: false,xl: true },
  { id: 'b220_1', kind: 'line', x: 240, name: '220kV 出线 2', qf: true, zm: false, fm: true, gnd: false,xl: true },
  { id: 'b220_2', kind: 'line', x: 480, name: '220kV 出线 3', qf: true, zm: false, fm: true, gnd: false,xl: true },
  { id: 'b220_3', kind: 'ml', x: 960, name: '220kV 母联', qf: true, zm: true, fm: true, gnd: false, gnd2: false,xl: true },
  { id: 'b220_4', kind: 'line', x: 1200, name: '220kV 出线 4', qf: true, zm: true, fm: false, gnd: false,xl: true },
  { id: 'b220_5', kind: 'line', x: 1440, name: '220kV 出线 5', qf: true, zm: true, fm: false, gnd: false,xl: true },
  { id: 'b220_6', kind: 'zb', x: 1680, name: '主变 1', qf: true, zm: true, fm: false, gnd: false,xl:true }
]

const BAY_110: Array<Omit<Bay, 'voltage'>> = [
  { id: 'b110_0', kind: 'line', x: 0, name: '110kV 出线 1', qf: true, zm: false, fm: true, gnd: false,xl:true },
  { id: 'b110_1', kind: 'line', x: 240, name: '110kV 出线 2', qf: true, zm: false, fm: true, gnd: false,xl:true },
  { id: 'b110_2', kind: 'line', x: 480, name: '110kV 出线 3', qf: true, zm: false, fm: true, gnd: false,xl:true },
  { id: 'b110_3', kind: 'ml', x: 720, name: '110kV 母联', qf: false, zm: false, fm: false, gnd: false, gnd2: false,xl:true },
  { id: 'b110_4', kind: 'line', x: 960, name: '110kV 出线 4', qf: true, zm: true, fm: false, gnd: false,xl:true },
  { id: 'b110_5', kind: 'line', x: 1200, name: '110kV 出线 5', qf: true, zm: true, fm: false, gnd: false,xl:true}
]

const BAY_35: Array<Omit<Bay, 'voltage'>> = [
  { id: 'b35_0', kind: 'line', x: 0, name: '35kV 出线 1', qf: true, zm: true, fm: false, gnd: false,gnd2: false,gnd3:false,xl:true },
  { id: 'b35_1', kind: 'line', x: 240, name: '35kV 出线 2', qf: true, zm: true, fm: false, gnd: false,gnd2: false,gnd3:false,xl:true },
  { id: 'b35_2', kind: 'line', x: 480, name: '35kV 出线 3', qf: true, zm: true, fm: false, gnd: false,gnd2: false,gnd3:false,xl:true },
  { id: 'b35_3', kind: 'line', x: 960, name: '35kV 出线 4', qf: true, zm: true, fm: false, gnd: false,gnd2: false,gnd3:false,xl: true },
  { id: 'b35_4', kind: 'line', x: 1200, name: '35kV 出线 5', qf: true, zm: true, fm: false, gnd: false,gnd2: false,gnd3:false,xl:true }
]

/* ============================ 别名（操作票解析） ========================== */

const ROLE_SYNONYM: Record<DeviceRole, string[]> = {
  breaker: ['断路器', '开关', 'QF', 'qf'],
  disconnector: ['刀闸', '隔离开关', '闸刀', '刀开关'],
  ground: ['接地刀闸', '地刀', '接地开关', '接地']
}

/** 归一化：去掉空白与常见分隔符，统一大小写与全角 */
export function normalizeKey(input: string): string {
  return String(input ?? '')
    .normalize('NFKC')
    .replace(/[\s_\-—－·、,，.。:：()（）[\]【】"'"'']/g, '')
    .toLowerCase()
}

function pushAlias(
  map: Map<string, DeviceDef>,
  ambiguous: Set<string>,
  key: string,
  device: DeviceDef
): void {
  const k = normalizeKey(key)
  if (!k || ambiguous.has(k)) return
  const exist = map.get(k)
  if (exist && exist !== device) {
    // 同一个名字对应多个设备 → 视为歧义，宁可不解析也不能误操作
    map.delete(k)
    ambiguous.add(k)
    return
  }
  map.set(k, device)
}

/* ============================== 模型工厂 ================================= */

export function createStationModel(): StationModel {
  const bays220: Bay[] = BAY_220.map(b => ({ ...b, voltage: 220 as Voltage }))
  const bays110: Bay[] = BAY_110.map(b => ({ ...b, voltage: 110 as Voltage }))
  const bays35: Bay[] = BAY_35.map(b => ({ ...b, voltage: 35 as Voltage, x: b.x + 2500 }))
  const bays: Bay[] = [...bays220, ...bays110, ...bays35]

  const wires: WireSeg[] = []
  const devices: DeviceDef[] = []

  function addDevice(def: Omit<DeviceDef, 'get' | 'set'>, get: () => boolean, set: (v: boolean) => void): DeviceDef {
    const device: DeviceDef = { ...def, get, set }
    devices.push(device)
    return device
  }

  const bus220Seg = { discLeft: true, qf: true, discRight: true }
  const bus35Seg = { discLeft: true, qf: true, discRight: true }
  const bus220PT = { disc: true }
  const tr110State = { qf: true, zm: true, fm: true, gnd: false }
  const tr35State = { qf: true, gnd: false, zd: true }

  /* ---------------------------- 间隔构建 ---------------------------- */

  function buildDoubleBusBay(bay: Bay, G: typeof GEOM[220] | typeof GEOM[110], bus1Node: string, bus2Node: string): void {
    const x = bay.x
    const xm = x + G.dx
    const id = bay.id
    const v = bay.voltage

    wires.push({ a: bus1Node, b: id + '_zm_top', points: [[x, G.bus1Y], [x, G.zmTop]] })
    addDevice(
      {
        id: id + '-zm', label: bay.name + ' 正母刀闸', kind: 'v-switch', role: 'disconnector',
        voltage: v, bayId: id, x, y: G.zmTop + G.zmH / 2, w: 40, h: G.zmH,
        nodeA: id + '_zm_top', nodeB: id + '_zm_bot'
      },
      () => bay.zm, val => { bay.zm = val }
    )

    wires.push({ a: bus2Node, b: id + '_fm_top', points: [[xm, G.bus2Y], [xm, G.fmTop]] })
    addDevice(
      {
        id: id + '-fm', label: bay.name + ' 副母刀闸', kind: 'v-switch', role: 'disconnector',
        voltage: v, bayId: id, x: xm, y: G.fmTop + G.fmH / 2, w: 40, h: G.fmH,
        nodeA: id + '_fm_top', nodeB: id + '_fm_bot'
      },
      () => bay.fm, val => { bay.fm = val }
    )

    if (bay.kind !== 'ml') {
      wires.push({ a: id + '_zm_bot', b: id + '_node', points: [[x, G.zmTop + G.zmH], [x, G.node]] })
      wires.push({
        a: id + '_fm_bot', b: id + '_node',
        points: [[xm, G.fmTop + G.fmH], [xm, G.node], [x, G.node]]
      })
      wires.push({ a: id + '_node', b: id + '_gnd_xlc', points: [[x, G.gndMx], [x-62, G.gndMx],[x-62,G.gndMx+12]]})
      addDevice(
        {
          id: id+'gnd-mx',label: bay.name + ' 母线侧接地闸刀',kind:'v-switch',role: 'ground',
          voltage: v, bayId: id, x: x - 62, y: G.gndMx + 12 + 24, w: 40, h: 48,
          nodeA: id + '_gnd_xlc', nodeB: 'ground'
        },
        () => bay.gnd3 || false, val => { bay.gnd3 = val }
      )
      addDevice(
        {
          id: id + '-qf', label: bay.name + ' 断路器', kind: 'v-breaker', role: 'breaker',
          voltage: v, bayId: id, x, y: G.qfTop + G.qfH / 2, w: 34, h: G.qfH,
          nodeA: id + '_qf_top', nodeB: id + '_qf_bot'
        },
        () => bay.qf, val => { bay.qf = val }
      )
      wires.push({ a: id + '_node', b: id + '_qf_top', points: [[x, G.node], [x, G.qfTop]] })
      wires.push({ a: id + '_qf_bot', b: id + '_gnd_bus', points: [[x, G.qfTop + G.qfH], [x, G.gndXlc]] })
      wires.push({
        a: id + '_gnd_bus', b: id + '_gnd_sw',
        points: [[x, G.gndXlc], [x - 62, G.gndXlc], [x - 62, G.gndXlc + 12]]
      })
      addDevice(
        {
          id: id + '-gnd-xlc', label: bay.name + ' 开关线路侧接地刀闸', kind: 'v-switch', role: 'ground',
          voltage: v, bayId: id, x: x - 62, y: G.gndXlc + 12 + 24, w: 40, h: 48,
          nodeA: id + '_gnd_bus', nodeB: 'ground'
        },
        () => bay.gnd2 || false, val => { bay.gnd2 = val }
      )
      wires.push({ a: id + '_gnd_bus', b: id + '_xl_top', points: [[x, G.gndXlc], [x, G.xlTop]]})
      addDevice(
        {
          id: id+'-xl',label:bay.name + ' 线路闸刀',kind: 'v-switch',role: 'disconnector',
          voltage: v,bayId: id,x,y:G.xlTop+G.xlH/2,w:40,h:G.xlH,
          nodeA: id+'_xl_top',nodeB: id+'_xl_bot'
        },
        () => bay.xl,val =>{bay.xl=val}
      )
      wires.push({ a: id + '_xl_bot', b: id + '_term', points: [[x, G.xlTop+G.xlH], [x, G.term]]})
      wires.push({ a: id + '_xl_bot', b: id + '_gnd', points: [[x, G.gnd], [x+62, G.gnd],[x+62,G.gnd+12]]})
      addDevice(
        {
          id: id + '-gnd', label: bay.name + ' 线路接地刀闸', kind: 'v-switch', role: 'ground',
          voltage: v, bayId: id, x: x + 62, y: G.gnd + 12 + 24, w: 40, h: 48,
          nodeA: id + '_gnd_bus', nodeB: 'ground'
        },
        () => bay.gnd, val => { bay.gnd = val }
      )
    } else {
      wires.push({ a: id + '_zm_bot', b: id + '_qf_zm', points: [[x, G.zmTop + G.zmH], [x, G.qfTop]] })
      addDevice(
        {
          id: id + '-qf', label: bay.name + ' 断路器', kind: 'v-breaker', role: 'breaker',
          voltage: v, bayId: id, x, y: G.qfTop + G.qfH / 2, w: 34, h: G.qfH,
          nodeA: id + '_qf_zm', nodeB: id + '_qf_fm'
        },
        () => bay.qf, val => { bay.qf = val }
      )
      wires.push({
        a: id + '_qf_fm', b: id + '_fm_bot',
        points: [[x, G.qfTop + G.qfH], [x, G.qfTop + G.qfH + 50], [xm, G.qfTop + G.qfH + 50], [xm, G.fmTop + G.fmH]]
      })
    }
  }

  function buildSingleBusBay(bay: Bay): void {
    const G = GEOM[35]
    const x = bay.x
    const id = bay.id
    const busNode = x < SEG35_X ? 'bus35L' : 'bus35R'

    wires.push({ a: busNode, b: id + '_zm_top', points: [[x, G.busY], [x, G.zmTop]] })
    addDevice({
      id: id+'-zm', label: bay.name + ' 母线闸刀',kind:'v-switch',role:'disconnector',
      voltage: 35,bayId:id,x, y: G.zmTop+G.zmH/2, w: 40, h: G.zmH,
      nodeA: id + '_zm_top', nodeB: id + '_zm_bot'
    },()=> bay.zm,val => {bay.zm = val})
    wires.push({a: id + '_zm_bot',b: id + '_qf_top',points:[[x,G.zmTop+G.zmH],[x,G.qfTop]]})

    wires.push({ a: id + '_zm_bot', b: id + '_gnd_mx', points: [[x, G.gndMx], [x-62, G.gndMx],[x-62,G.gndMx+12]]})
    addDevice(
      {
        id: id + '-gnd-mx', label: bay.name + ' 开关母线侧接地刀闸', kind: 'v-switch', role: 'ground',
        voltage: 35, bayId: id, x: x - 62, y: G.gndMx + 12 + 24, w: 40, h: 48,
        nodeA: id + '_gnd_mx', nodeB: 'ground'
      },
      () => bay.gnd3 || false, val => { bay.gnd3 = val }
    )
    addDevice(
      {
        id: id + '-qf', label: bay.name + ' 断路器', kind: 'v-breaker', role: 'breaker',
        voltage: 35, bayId: id, x, y: G.qfTop + G.qfH / 2, w: 34, h: G.qfH,
        nodeA: id + '_qf_top', nodeB: id + '_qf_bot'
      },
      () => bay.qf, val => { bay.qf = val }
    )
    wires.push({ a: id + '_qf_bot', b: id + '_xl_top', points: [[x, G.qfTop + G.qfH], [x, G.xlTop]] })

    wires.push({ a: id + '_qf_bot', b: id + '_gnd_xlc', points: [[x, G.gndXlc], [x+62, G.gndXlc],[x+62,G.gndXlc+12]]})
    addDevice(
      {
        id: id + '-gnd-xlc', label: bay.name + ' 开关线路侧接地刀闸', kind: 'v-switch', role: 'ground',
        voltage: 35, bayId: id, x: x + 62, y: G.gndXlc + 12 + 24, w: 40, h: 48,
        nodeA: id + '_gnd_xlc', nodeB: 'ground'
      },
      () => bay.gnd2 || false, val => { bay.gnd2 = val }
    )
    addDevice(
      {
        id: id + '-xl', label: bay.name + ' 线路闸刀', kind: 'v-switch', role: 'disconnector',
        voltage: 35, bayId: id, x, y: G.xlTop + G.xlH / 2, w: 40, h: G.xlH,
        nodeA: id + '_xl_top', nodeB: id + '_xl_bot'
      },
      () => bay.xl, val => { bay.xl = val }
    )
    wires.push({ a: id + '_xl_bot', b: id + '_gnd_bus', points: [[x, G.xlTop + G.xlH], [x, G.gnd]] })
    wires.push({
      a: id + '_gnd_bus', b: id + '_gnd_sw',
      points: [[x, G.gnd], [x - 62, G.gnd], [x - 62, G.gnd + 12]]
    })
    addDevice(
      {
        id: id + '-gnd', label: bay.name + ' 接地刀闸', kind: 'v-switch', role: 'ground',
        voltage: 35, bayId: id, x: x - 62, y: G.gnd + 12 + 24, w: 40, h: 48,
        nodeA: id + '_gnd_bus', nodeB: 'ground'
      },
      () => bay.gnd, val => { bay.gnd = val }
    )
    wires.push({ a: id + '_gnd_bus', b: id + '_term', points: [[x, G.gnd], [x, G.term]] })
  }

  /** 110kV 主变间隔（反向：主变在上，母线在下） */
  function build110TransformerBay(): void {
    const x = TR110_X
    const label = '110kV 主变间隔'

    wires.push({
      a: 'transformer_M', b: 'tr110_term',
      points: [[TR_M_CENTER.x, TR_M_CENTER.y], [x, TR_M_CENTER.y], [x, TR110_TERM_Y]]
    })
    wires.push({ a: 'tr110_term', b: 'tr110_gnd_node', points: [[x, TR110_TERM_Y], [x, TR110_GND_Y]] })
    wires.push({
      a: 'tr110_gnd_node', b: 'tr110_gnd_sw',
      points: [[x, TR110_GND_Y], [x - 55, TR110_GND_Y], [x - 55, TR110_GND_Y + 12]]
    })
    addDevice(
      {
        id: 'tr110-gnd', label: label + ' 接地刀闸', kind: 'v-switch', role: 'ground',
        voltage: 110, bayId: 'tr110', x: x - 55, y: TR110_GND_Y + 12 + 22, w: 40, h: 44,
        nodeA: 'tr110_gnd_node', nodeB: 'ground'
      },
      () => tr110State.gnd, val => { tr110State.gnd = val }
    )

    wires.push({ a: 'tr110_gnd_node', b: 'tr110_qf_top', points: [[x, TR110_GND_Y], [x, TR110_QF_Y]] })
    addDevice(
      {
        id: 'tr110-qf', label: label + ' 断路器', kind: 'v-breaker', role: 'breaker',
        voltage: 110, bayId: 'tr110', x, y: TR110_QF_Y + TR110_QF_H / 2, w: 34, h: TR110_QF_H,
        nodeA: 'tr110_qf_top', nodeB: 'tr110_qf_bot'
      },
      () => tr110State.qf, val => { tr110State.qf = val }
    )

    wires.push({ a: 'tr110_qf_bot', b: 'tr110_node', points: [[x, TR110_QF_Y + TR110_QF_H], [x, TR110_NODE_Y]] })
    wires.push({ a: 'tr110_node', b: 'tr110_zm_top', points: [[x, TR110_NODE_Y], [x, TR110_ZM_Y]] })
    addDevice(
      {
        id: 'tr110-zm', label: label + ' 正母刀闸', kind: 'v-switch', role: 'disconnector',
        voltage: 110, bayId: 'tr110', x, y: TR110_ZM_Y + TR110_ZM_H / 2, w: 40, h: TR110_ZM_H,
        nodeA: 'tr110_zm_top', nodeB: 'tr110_zm_bot'
      },
      () => tr110State.zm, val => { tr110State.zm = val }
    )
    wires.push({ a: 'tr110_zm_bot', b: 'bus110_1', points: [[x, TR110_ZM_Y + TR110_ZM_H], [x, GEOM[110].bus1Y]] })

    wires.push({
      a: 'tr110_node', b: 'tr110_fm_top',
      points: [[x, TR110_NODE_Y], [TR110_FM_X, TR110_NODE_Y], [TR110_FM_X, TR110_FM_Y]]
    })
    addDevice(
      {
        id: 'tr110-fm', label: label + ' 副母刀闸', kind: 'v-switch', role: 'disconnector',
        voltage: 110, bayId: 'tr110', x: TR110_FM_X, y: TR110_FM_Y + TR110_FM_H / 2, w: 40, h: TR110_FM_H,
        nodeA: 'tr110_fm_top', nodeB: 'tr110_fm_bot'
      },
      () => tr110State.fm, val => { tr110State.fm = val }
    )
    wires.push({
      a: 'tr110_fm_bot', b: 'bus110_2',
      points: [[TR110_FM_X, TR110_FM_Y + TR110_FM_H], [TR110_FM_X, GEOM[110].bus2Y]]
    })
  }

  /** 35kV 主变间隔（从主变向下到 35kV 母线） */
  function build35TransformerBay(): void {
    const x = TR35_X
    const G = GEOM[35]
    const label = '35kV 主变间隔'

    wires.push({
      a: 'transformer_L', b: 'tr35_term',
      points: [[TR_L_CENTER.x, TR_L_CENTER.y + TR_R + 25], [x, TR_L_CENTER.y + TR_R + 25], [x, TR35_TERM_Y]]
    })
    wires.push({ a: 'tr35_term', b: 'tr35_qf_top', points: [[x, TR35_TERM_Y], [x, TR35_QF_Y]] })
    addDevice(
      {
        id: 'tr35-qf', label: label + ' 断路器', kind: 'v-breaker', role: 'breaker',
        voltage: 35, bayId: 'tr35', x, y: TR35_QF_Y + TR35_QF_H / 2, w: 34, h: TR35_QF_H,
        nodeA: 'tr35_qf_top', nodeB: 'tr35_qf_bot'
      },
      () => tr35State.qf, val => { tr35State.qf = val }
    )
    wires.push({ a: 'tr35_qf_top', b: 'tr35_gnd_node', points: [[x, TR35_GND_Y], [x, TR35_GND_Y]] })
    wires.push({
      a: 'tr35_gnd_node', b: 'tr35_gnd_sw',
      points: [[x, TR35_GND_Y], [x - 62, TR35_GND_Y], [x - 62, TR35_GND_Y + 12]]
    })
    addDevice(
      {
        id: 'tr35-gnd', label: label + ' 接地刀闸', kind: 'v-switch', role: 'ground',
        voltage: 35, bayId: 'tr35', x: x - 62, y: TR35_GND_Y + 12 + 24, w: 40, h: 48,
        nodeA: 'tr35_gnd_node', nodeB: 'ground'
      },
      () => tr35State.gnd, val => { tr35State.gnd = val }
    )
    wires.push({ a: 'tr35_qf_bot', b: 'bus35L', points: [[x, TR35_QF_Y + TR35_QF_H], [x, G.busY]] })
  }

  /* ---------------------------- 拓扑组装 ---------------------------- */

  const lx = SEG_X - SEG_DISC_OFFSET
  const rx = SEG_X + SEG_DISC_OFFSET

  wires.push({
    a: 'bus220_1L', b: 'seg220_L_in',
    points: [[SEG_BUS_LEFT_END, 0], [SEG_BUS_LEFT_END, SEG_Y], [lx - SEG_DISC_W / 2, SEG_Y]]
  })
  addDevice(
    {
      id: 'seg220-disc-l', label: '220kV 母线分段 左刀闸', kind: 'h-switch', role: 'disconnector',
      voltage: 220, bayId: 'seg220', x: lx, y: SEG_Y, w: SEG_DISC_W, h: 36,
      nodeA: 'seg220_L_in', nodeB: 'seg220_L_out'
    },
    () => bus220Seg.discLeft, val => { bus220Seg.discLeft = val }
  )
  wires.push({ a: 'seg220_L_out', b: 'seg220_L_out', points: [[lx + SEG_DISC_W / 2, SEG_Y], [SEG_X - SEG_DISC_W / 2, SEG_Y]] })
  addDevice(
    {
      id: 'seg220-qf', label: '220kV 母线分段 断路器', kind: 'h-breaker', role: 'breaker',
      voltage: 220, bayId: 'seg220', x: SEG_X, y: SEG_Y, w: SEG_DISC_W, h: 30,
      nodeA: 'seg220_L_out', nodeB: 'seg220_R_in'
    },
    () => bus220Seg.qf, val => { bus220Seg.qf = val }
  )
  wires.push({ a: 'seg220_R_in', b: 'seg220_R_in', points: [[SEG_X + SEG_DISC_W / 2, SEG_Y], [rx - SEG_DISC_W / 2, SEG_Y]] })
  addDevice(
    {
      id: 'seg220-disc-r', label: '220kV 母线分段 右刀闸', kind: 'h-switch', role: 'disconnector',
      voltage: 220, bayId: 'seg220', x: rx, y: SEG_Y, w: SEG_DISC_W, h: 36,
      nodeA: 'seg220_R_in', nodeB: 'seg220_R_out'
    },
    () => bus220Seg.discRight, val => { bus220Seg.discRight = val }
  )
  wires.push({
    a: 'seg220_R_out', b: 'bus220_1R',
    points: [[rx + SEG_DISC_W / 2, SEG_Y], [SEG_BUS_RIGHT_START, SEG_Y], [SEG_BUS_RIGHT_START, 0]]
  })

  /* 220kV 母线压变 */
  wires.push({ a: 'bus220_1L', b: 'pt220_top', points: [[PT_X, 0], [PT_X, PT_DISC_TOP]] })
  addDevice(
    {
      id: 'pt220-disc', label: '220kV 母线压变 隔离开关', kind: 'v-switch', role: 'disconnector',
      voltage: 220, bayId: 'pt220', x: PT_X, y: PT_DISC_TOP + PT_DISC_H / 2, w: 40, h: PT_DISC_H,
      nodeA: 'pt220_top', nodeB: 'pt220_bot'
    },
    () => bus220PT.disc, val => { bus220PT.disc = val }
  )
  wires.push({ a: 'pt220_bot', b: 'pt220_body', points: [[PT_X, PT_DISC_TOP + PT_DISC_H], [PT_X, PT_Y - PT_R]] })

  for (const bay of bays220) {
    buildDoubleBusBay(bay, GEOM[220], bay.x < SEG_X ? 'bus220_1L' : 'bus220_1R', 'bus220_2')
  }

  /* 主变内部连接（磁耦合） */
  wires.push({ a: 'transformer_H', b: 'transformer_M', points: [] })
  wires.push({ a: 'transformer_H', b: 'transformer_L', points: [] })
  wires.push({
    a: 'b220_6_term', b: 'transformer_H',
    points: [[TR_X, GEOM[220].term], [TR_X, TR_H_CENTER.y - TR_R - 5]]
  })

  build110TransformerBay()
  for (const bay of bays110) {
    buildDoubleBusBay(bay, GEOM[110], 'bus110_1', 'bus110_2')
  }

  build35TransformerBay()

  /* 35kV 母线分段 */
  const lx35 = SEG35_X - SEG35_DISC_OFFSET
  const rx35 = SEG35_X + SEG35_DISC_OFFSET
  const segY35 = GEOM[35].busY

  wires.push({ a: 'bus35L', b: 'seg35_L_in', points: [[SEG35_BUS_LEFT_END, segY35], [lx35 - SEG35_DISC_W / 2, segY35]] })
  addDevice(
    {
      id: 'seg35-disc-l', label: '35kV 母线分段 I母闸刀', kind: 'h-switch', role: 'disconnector',
      voltage: 35, bayId: 'seg35', x: lx35, y: segY35, w: SEG35_DISC_W, h: 32,
      nodeA: 'seg35_L_in', nodeB: 'seg35_L_out'
    },
    () => bus35Seg.discLeft, val => { bus35Seg.discLeft = val }
  )
  wires.push({ a: 'seg35_L_out', b: 'seg35_L_out', points: [[lx35 + SEG35_DISC_W / 2, segY35], [SEG35_X - SEG35_DISC_W / 2, segY35]] })
  addDevice(
    {
      id: 'seg35-qf', label: '35kV 母线分段 断路器', kind: 'h-breaker', role: 'breaker',
      voltage: 35, bayId: 'seg35', x: SEG35_X, y: segY35, w: SEG35_DISC_W, h: 30,
      nodeA: 'seg35_L_out', nodeB: 'seg35_R_in'
    },
    () => bus35Seg.qf, val => { bus35Seg.qf = val }
  )
  wires.push({ a: 'seg35_R_in', b: 'seg35_R_in', points: [[SEG35_X + SEG35_DISC_W / 2, segY35], [rx35 - SEG35_DISC_W / 2, segY35]] })
  addDevice(
    {
      id: 'seg35-disc-r', label: '35kV 母线分段 II母闸刀', kind: 'h-switch', role: 'disconnector',
      voltage: 35, bayId: 'seg35', x: rx35, y: segY35, w: SEG35_DISC_W, h: 32,
      nodeA: 'seg35_R_in', nodeB: 'seg35_R_out'
    },
    () => bus35Seg.discRight, val => { bus35Seg.discRight = val }
  )
  wires.push({ a: 'seg35_R_out', b: 'bus35R', points: [[rx35 + SEG35_DISC_W / 2, segY35], [SEG35_BUS_RIGHT_START, segY35]] })

  for (const bay of bays35) buildSingleBusBay(bay)

  /* ---------------------------- 别名索引 ---------------------------- */

  const deviceMap = new Map<string, DeviceDef>()
  const aliasMap = new Map<string, DeviceDef>()
  const ambiguousAliases = new Set<string>()
  for (const d of devices) {
    deviceMap.set(d.id, d)
    pushAlias(aliasMap, ambiguousAliases, d.id, d)
    pushAlias(aliasMap, ambiguousAliases, d.id.replace(/_/g, '-'), d)
    pushAlias(aliasMap, ambiguousAliases, d.label, d)

    const bay = bays.find(b => b.id === d.bayId)
    if (bay) {
      for (const syn of ROLE_SYNONYM[d.role]) {
        pushAlias(aliasMap, ambiguousAliases, bay.name + syn, d)
        pushAlias(aliasMap, ambiguousAliases, bay.name + ' ' + syn, d)
      }
      pushAlias(aliasMap, ambiguousAliases, bay.name + d.id.slice(-3), d)
    }
  }
  pushAlias(aliasMap, ambiguousAliases, '220kV 正母压变 隔离开关', deviceMap.get('pt220-disc')!)
  pushAlias(aliasMap, ambiguousAliases, '220kV 正母压变 隔离开关', deviceMap.get('pt220-disc')!)

  /* ---------------------------- 电源（潮流起点） ---------------------------- */

  const termYOf = (v: Voltage) => (v === 220 ? GEOM[220].term : v === 110 ? GEOM[110].term : GEOM[35].term)
  const sources: SourceDef[] = bays
    .filter(b => b.kind === 'line' || b.kind === 'zb')
    .map(b => ({ id: b.id, label: b.name, voltage: b.voltage, x: b.x, termY: termYOf(b.voltage) }))

  return { bays, bays220, bays110, bays35, wires, devices, deviceMap, aliasMap, ambiguousAliases, sources }
}

/* ============================== 带电计算 ================================= */

export function computeEnergized(
  model: StationModel,
  sourceConfig: Record<string, boolean>
): Set<string> {
  const adj = new Map<string, string[]>()

  function addEdge(a: string, b: string): void {
    let la = adj.get(a)
    if (!la) { la = []; adj.set(a, la) }
    let lb = adj.get(b)
    if (!lb) { lb = []; adj.set(b, lb) }
    la.push(b)
    lb.push(a)
  }

  for (const w of model.wires) addEdge(w.a, w.b)
  for (const d of model.devices) if (d.get()) addEdge(d.nodeA, d.nodeB)

  const start: string[] = []
  for (const s of model.sources) if (sourceConfig[s.id]) start.push(s.id + '_term')

  const visited = new Set<string>(start)
  const queue = start.slice()
  for (let head = 0; head < queue.length; head++) {
    const list = adj.get(queue[head])
    if (!list) continue
    for (const m of list) {
      if (!visited.has(m)) { visited.add(m); queue.push(m) }
    }
  }
  return visited
}

/** 解析操作票中的设备标识 */
export function resolveDevice(model: StationModel, token: string): DeviceDef | null {
  if (!token) return null
  const direct = model.deviceMap.get(token)
  if (direct) return direct

  const key = normalizeKey(token)
  if (!key) return null

  const byAlias = model.aliasMap.get(key)
  if (byAlias) return byAlias
  if (model.ambiguousAliases.has(key)) return null

  // 模糊匹配：包含关系取最短命中，尽量避免误配
  let best: DeviceDef | null = null
  let bestLen = Infinity
  for (const d of model.devices) {
    const lk = normalizeKey(d.label)
    if (!lk) continue
    if (lk.includes(key) || key.includes(lk)) {
      if (lk.length < bestLen) { bestLen = lk.length; best = d }
    }
  }
  return best
}
