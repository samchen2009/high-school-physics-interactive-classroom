const chapters = {
  'motion-description':['物体运动的描述','Description of Motion','先学会用坐标、图像和物理量准确描述“物体怎样运动”。',['质点与参考系','位置、位移与路程','平均速度与瞬时速度','加速度','x-t 与 v-t 图像']],
  'uniform-motion':['匀变速直线运动','Uniformly Accelerated Motion','从速度均匀变化出发，把公式、图像和真实运动连起来。',['速度—时间规律','位移—时间规律','速度—位移关系','自由落体','追及与相遇']],
  forces:['力与相互作用','Forces and Interactions','看清每一个力从哪里来，再把复杂情境变成规范受力图。',['重力与重心','弹力与胡克定律','静摩擦与滑动摩擦','力的合成与分解','共点力平衡']],
  newton:['牛顿运动定律',"Newton's Laws of Motion",'用合力解释加速度，建立高中动力学最重要的解题链。',['牛顿第一定律','牛顿第二定律','牛顿第三定律','连接体与整体隔离法','超重与失重']],
  energy:['功和机械能','Work and Mechanical Energy','换一个视角研究运动：不追每一刻的力，而比较过程前后的能量。',['功与功率','动能定理','重力势能与弹性势能','机械能守恒','功能关系']],
  projectile:['抛体运动','Projectile Motion','把一个曲线运动拆成两个熟悉的直线运动。',['运动的合成与分解','平抛运动','斜抛运动','轨迹方程','临界与相遇']],
  circular:['圆周运动','Circular Motion','区分描述圆周运动的物理量，并理解向心力不是一种新的力。',['线速度与角速度','周期与频率','向心加速度','向心力来源','竖直圆周临界']],
  gravitation:['万有引力与航天','Gravitation and Spaceflight','从苹果落地走向卫星运行，用同一条规律连接地面与太空。',['万有引力定律','重力与万有引力','环绕速度与周期','同步卫星','宇宙速度']],
  circuits:['电路与闭合电路','Electric Circuits','从电荷的定向移动到完整电路中的能量转化。',['电流、电压与电阻','欧姆定律','电阻定律','多用电表','闭合电路欧姆定律','电功与电功率']],
  'magnetic-field':['磁场与安培力','Magnetic Field and Ampère Force','用磁感应强度和磁场线描述磁场，并研究电流受到的作用。',['磁场与磁感应强度','磁场线','安培力','左手定则','通电线圈与电动机']],
  lorentz:['洛伦兹力与带电粒子','Lorentz Force','看清磁场怎样改变带电粒子的运动方向而不直接改变速率。',['洛伦兹力方向','匀速圆周运动','速度选择器','质谱仪','回旋加速器']],
  induction:['电磁感应','Electromagnetic Induction','从磁通量的变化判断感应电流的方向和大小。',['磁通量','感应电流的条件','楞次定律','法拉第电磁感应定律','自感与涡流']],
  'ac-wave':['交变电流与电磁波','Alternating Current and Electromagnetic Waves','连接发电、输电、变压和无线通信的基本规律。',['正弦交变电流','有效值','变压器','远距离输电','电磁振荡','电磁波谱']],
  momentum:['动量与碰撞','Momentum and Collisions','用冲量和动量守恒处理作用时间短、内力很大的过程。',['动量与冲量','动量定理','动量守恒条件','弹性与非弹性碰撞','反冲模型']],
  oscillation:['机械振动','Mechanical Oscillations','从周期性的往复运动理解简谐运动、共振和能量转换。',['简谐运动','振动图像','单摆','受迫振动','共振']],
  waves:['机械波','Mechanical Waves','区分质点振动与波的传播，读懂波形图中的空间信息。',['波的形成与传播','波长、频率和波速','波动图像','干涉与衍射','多普勒效应']],
  optics:['光','Optics','从几何光学走向光的波动性。',['光的折射','全反射','光的干涉','光的衍射','光的偏振']],
  thermal:['分子动理论与气体','Molecular Theory and Gases','用微观粒子的无规则运动解释温度、压强和热学过程。',['分子动理论','温度与内能','气体实验定律','理想气体','热力学第一定律','热力学第二定律']],
  modern:['原子与原子核','Atomic and Nuclear Physics','进入经典物理之外的尺度，理解能量量子化和核能。',['光电效应','波粒二象性','原子能级','天然放射现象','核反应','质能方程']]
};
const id = new URLSearchParams(location.search).get('id');
const chapter = chapters[id] || ['章节入口','Chapter Preview','请选择一个有效的高中物理章节入口。',['返回课程首页重新选择']];
document.title = `${chapter[0]}｜高中物理互动课堂`;
document.querySelector('#chapterTitle').textContent = chapter[0];
document.querySelector('#chapterEnglish').textContent = chapter[1];
document.querySelector('#chapterIntro').textContent = chapter[2];
document.querySelector('#chapterTopics').replaceChildren(...chapter[3].map((topic) => {
  const item = document.createElement('li');
  item.textContent = topic;
  return item;
}));
