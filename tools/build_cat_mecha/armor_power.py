"""Compact astral twin power cartridges, authored in the preserved rest space."""
from mathutils import Vector
from geometry import loft, panel, tube
from armor_shapes import joint_ring, ribbon


def backpack(c):
    """Chest/spine_03 only; |x|<.41, y=1.27..1.64, z=-.34..-.17.

    Inner white walls stay outside |x|=.23, clear of the .22-wide head.
    Ports face out and slightly forward so the white housing and blue aperture
    remain readable in quarter view without wings or oversized luminous bulbs.
    """
    m=c['m']
    shell,trim,edge,gem,liner=[m[k] for k in
        ['ArmorShell','ArmorTrim','ArmorEdge','ArmorGem','ArmorLiner']]
    bone='spine_03'
    pre=lambda part:'Tier_%s_Slot_chest_spine_03_%s'%(c['tier'],part)
    panel(pre('TwinPowerDorsalMount'),[(-.205,1.475,-.173),(.205,1.475,-.173),
          (.179,1.289,-.178),(-.179,1.289,-.178)],.030,liner,bone,.003)
    for side in [-1,1]:
        x=side*.300
        profiles=[(1.278,.032,.030,-.236),(1.304,.052,.050,-.247),
                  (1.359,.062,.059,-.252),(1.524,.060,.059,-.257),
                  (1.598,.051,.052,-.259),(1.637,.034,.036,-.255)]
        body=loft(pre('WhitePowerCartridge'+str(side)),profiles,shell,bone,12,.003,False)
        for vertex in body.data.vertices:
            # Blender Z is the authored rest-space Y axis; lean the upper cap out.
            vertex.co.x+=x+side*max(0,vertex.co.z-1.36)*.045
        body.data.update()
        rear=[(x-.038,1.566,-.316),(x+.038,1.566,-.316),
              (x+.045,1.533,-.318),(x+.044,1.350,-.308),
              (x,1.318,-.301),(x-.044,1.350,-.308),
              (x-.045,1.533,-.318)]
        panel(pre('NavyPowerServiceCover'+str(side)),rear,.008,trim,bone,.002)
        ribbon(pre('FinePowerFrame'+str(side)),rear+[rear[0]],.0030,edge,bone,.002)
        for row in range(3):
            y=1.526-row*.025
            ribbon(pre('RearCoolingVent%s_%s'%(side,row)),
                   [(x-.027,y,-.327),(x+.027,y,-.327)],.006,liner,bone,.002)
            ribbon(pre('RearCoolingSignal%s_%s'%(side,row)),
                   [(x-.018,y-.0005,-.330),(x+.016,y-.0005,-.330)],.0023,gem,bone,.001)
        # A recessed navy end cap inside a white bearing, not a glowing sphere.
        axis=Vector((side*.91,0,.415)).normalized()
        center=Vector((x+side*.057,1.562,-.255))
        tube(pre('SidePortNavyHousing'+str(side)),center-axis*.013,center+axis*.014,
             [(0,.048),(.18,.052),(.82,.052),(1,.048)],trim,bone,24)
        joint_ring(pre('SidePortWhiteBearing'+str(side)),center+axis*.009,axis,
                   .052,.0070,shell,bone)
        joint_ring(pre('SidePortFineGoldLip'+str(side)),center+axis*.017,axis,
                   .043,.0022,edge,bone)
        joint_ring(pre('SidePortEnergyAnnulus'+str(side)),center+axis*.019,axis,
                   .034,.0040,gem,bone)
        tube(pre('SidePortRecessedCore'+str(side)),center+axis*.012,center+axis*.020,
             [(0,.023),(1,.023)],liner,bone,20)
        # Thin power feeds connect the cartridge to the backplate below the neck.
        ribbon(pre('PowerConduit'+str(side)),[(x-side*.026,1.345,-.313),
               (side*.223,1.303,-.255),(side*.168,1.286,-.220)],.0040,trim,bone,.003)
        ribbon(pre('PowerConduitSignal'+str(side)),[(x-side*.026,1.345,-.317),
               (side*.223,1.303,-.259),(side*.168,1.286,-.224)],.0018,gem,bone,.001)
