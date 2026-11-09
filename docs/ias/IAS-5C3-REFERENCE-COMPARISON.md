# IAS-5C3 Reference Comparison

확인일 2026-11-09. TrAdia에서 Barbarian / Human / Normal Attack / Primary only / Gear IAS 0으로 3개 후보에 IAS 0, 10, 20, 40, 60, 100, 150, 200을 입력했다(24개 출력 관측). Warren1001 v1.2.6의 breakpoint 표를 Legend Sword와 Zweihander에서 확인했다. 같은 조건의 13개 경계 행을 직접 대조했다.

| Weapon | Code / WSM | TrAdia sampled frames at IAS 0/10/20/40/60/100/150/200 | Warren breakpoint starts → frames | Direct table match |
|---|---|---|---|---|
| Legend Sword | 72h / -15 | 15/14/13/12/11/10/10/10 | 0:15, 7:14, 16:13, 30:12, 50:11, 83:10 | Yes, 6/6 rows |
| Zweihander | 9fb / -10 | 16/15/14/12/11/10/10/10 | 0:16, 4:15, 13:14, 23:13, 39:12, 60:11, 99:10 | Yes, 7/7 rows |
| Colossus Blade | 7gd / +5 | 18/17/16/14/13/12/11/10 | Warren full table not captured | No; excluded |

Total: 24 TrAdia sample outputs; 13 complete Warren breakpoint rows compared; 13/13 matching. These are reference comparisons, not empirical game captures. IAS 0..200 integer sweeps in local tests use the captured breakpoint intervals as fixtures and are not additional external observations.

References: [TrAdia calculator](https://tradia.me/en/diablo2/weapon_speed_calculator), [Warren1001 calculator](https://warren1001.github.io/IAS_Calculator/), [Warren source history](https://github.com/Warren1001/IAS_Calculator), [Amazon Basin 2HS](https://www.theamazonbasin.com/wiki/index.php/Barbarian_attack_speed).
