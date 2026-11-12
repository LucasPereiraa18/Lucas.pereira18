import { describe, expect, it } from "vitest";
import { calculateCollective, calculateLife, rewardAmounts } from "@/src/domain/pulse/engine";

const lifeCfg={delay_per_hour:1,absence:10,medical:5,sanction:15};
describe("pulse engine",()=>{
 it("calcula Vida com faltas e atraso acumulado",()=>{const r=calculateLife({delayMinutes:180,labels:["FALTA","FALTA"],config:lifeCfg});expect(r.percent).toBe(77);expect(r.absences).toBe(2)});
 it("aceita sinônimos de ocorrências",()=>{const r=calculateLife({delayMinutes:0,labels:["LICENÇA","ADVERTÊNCIA"],config:lifeCfg});expect(r.percent).toBe(80)});
 it("redistribui pesos da coletiva quando uma perna falta",()=>{const r=calculateCollective({sanitaryScore:null,deliveryScore:95,operationalErrors:2},{sanitary:40,delivery:40,errors:20});expect(r.legs).toHaveLength(2);expect(r.legs[0].effectiveWeight).toBeCloseTo(66.666,2);expect(r.percent).toBeCloseTo(94.333,2)});
 it("usa taxa relativa e pódio no prêmio",()=>{const r=rewardAmounts({life:92,executionRate:90,maxExecutionRate:100,collective:95,position:4,tenureFactor:1,caps:{attendance:100,score:100,collective:100,podium:{"1":100,"2":50,"3":25}}});expect(r.totalAmount).toBe(277)});
});
