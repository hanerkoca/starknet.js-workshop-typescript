import { ec } from "./signature";

const a = ec.starkCurve.test1;
const b = ec.starkCurve.CURVE.Fp.MASK;
const d = ec.starkCurve.getPublicKey("0x12", true);
const c = b