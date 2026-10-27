import os
import requests

save_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend/public/bikes'))
os.makedirs(save_dir, exist_ok=True)

images = {
    "commuter_splendor.jpg": "https://images.openai.com/static-rsc-4/8-uAyzuZqDLniCpEYv5Fq1UXi0L3wTM4z9zgXcjBJlaLHoPm6NbFyVglJxDGdQc6Rpx3GJ5zLwCb8EQStoGNih7PZdG_tnyhJL1fViVpYPvy4zEcaB0blhXjpxyfkbNZ2KEwvgnsBcokJojG0S0bFlpBAML1HHNwoOk0539FyxU?purpose=inline",
    "125cc_shine.jpg": "https://images.openai.com/static-rsc-4/cEjMCKwgzOxnx8h3PKWqSFLlSMzBONiPGc4qYCH8iekDK6k2JpsXHrlWuFaJkwtCN4TMN_UOLHu1WL0f4lBVZ2PdzLWgLDyi6Kil4UN_6wVBsuDOST7G6VHTYQnXnQ_iF_U8-I3IPE9zWIYPgyrObVbhDU2FZVSZeYHGYwqqTxU?purpose=inline",
    "street_pulsarns.jpg": "https://images.openai.com/static-rsc-4/-kBqHddSx51fzvxPjgY_Sr8i4VRNKiab2ywPYIe7CtvQgS558SFT9Gb16jxAOfIuHRtStYiO2TwhzAp46J0qJbeY40c6Jw-3ZwURuLP_HXxmg3B-Az_nY3hSuLg7tSFkjosGmi7G5XVu9S3EG-jhN7_PjN2rdr4SDz9uG8JEghU?purpose=inline",
    "sports_apache.jpg": "https://images.openai.com/static-rsc-4/7wHv2ZVYlV5UDsKvOLaxDr6uz8rsOeVXBlLPwGKw-Bcgz_mD7LJD7M2wddMelnbjMaPMkGCMK6rWopER9n4sCsIvpRLWCqYbnv83GOJY-JCCnUXekk7B1ji26echxvOWejTfPxl-LlBw5Pmr325a_yBfrsq9pNMUkCYiRJH4HAY?purpose=inline",
    "classic_retro.jpg": "https://images.openai.com/static-rsc-4/RDUU3P08XLrnaBrWxRGxx2To6856PjR2eXOqjU4oUa7_t3_pM84uQUqbZjkwLi4WvbRQ5ByugEAYQ7UsnMD04WTLDb-wuu_Ht49e4ry89HOvV32L_25gnGowVKBYewhI7E4z-U1a7nDnQtolhtrx0IJ2ZlEoouLtdhC-l3gtvXE?purpose=inline",
    "roadster_hunter.jpg": "https://images.openai.com/static-rsc-4/AQRpebaeLJKfu7gzKcnR0UqP7roPWtNGcx6go10KhwydvIbs_kcPlUif4MelFH8JUwZ_9Ol9Lg-Fhe3O56AsYF_g8Uu7nPne7R7TEkjA5Zi1mW2KE0_SRFUefR_UXAy8md7b_UZ8gpNUnI75ZwsC5_i25VzhLVxcirSVLEhacaE?purpose=inline",
    "performance_duke.jpg": "https://images.openai.com/static-rsc-4/jNxbTOxyvI9Bhs-mkT4ZJRu4g9ZOngeJVdLD7wQx9CTtuz-Wp0BWLD2rMqtIpVqEzgOWdA4_qUXxD9jHY5qWFueWUprpBb1kRHfG2RNeohc0y3nm25eP8yy2hpxy__qSJyQ4-03I3KR0pLSYkV83vd8jU2-NwNm90lN8DqMFAjg?purpose=inline",
    "adventure_xpulse.jpg": "https://images.openai.com/static-rsc-4/t-EqqGh0XW4eoqMFGtLH1m45liLnD_Vu4msK8ZAoN8W1trAGM0wUOFzj7YKSnlshYlMUbTclYSuGWpq0j0e_MJXFFaLOethtALcVJ-1TFElD-n29QtQiJzTGDTtsZRMgYS-cKs3PBPvzvP5_wqjr5hUt6Y9qtYjO3JE9pqQ_4po?purpose=inline",
    "cng_freedom.jpg": "https://images.openai.com/static-rsc-4/o4gemD-jhdI3ayo3ZGDND_Qd9zCElD6qBWk2KGfms1DarqlNb4vkj-Q9NxCblfZsI4qZoCM9_4kpHvFlx66d0IN3IrhmqvOZvU4Um1QWvp5t8lF9fTmjVc26Lv_ya-R_m8mDYzAkMsvHB0kTTXjdJUBRW-hzpt-bQMMUkN3VPuM?purpose=inline",
    "electric_revolt.jpg": "https://images.openai.com/static-rsc-4/hxKAC6s6rl1cuuoMUb5Fn4lRX8iju1kuZgY_TQqnnm_VxaGsZ1zdZFyIb_Thu-pgr-0FFRc3bnvJdwXyaZ2JuQJwlWnBAwY7P07MGlfY638dDsC1y8jQcaGSevcXmHSJEGQtVqC_i4qrCs8Mka2kvXCffJRTIvSdjmzUKar64g8?purpose=inline"
}

headers = {'User-Agent': 'Mozilla/5.0'}

for name, url in images.items():
    dest = os.path.join(save_dir, name)
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            with open(dest, 'wb') as f:
                f.write(r.content)
            print(f"Downloaded: {name} ({len(r.content)} bytes)")
        else:
            print(f"Failed {name}: status {r.status_code}")
    except Exception as e:
        print(f"Error {name}: {e}")

print("All category images downloaded!")
