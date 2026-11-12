export function MonthSelector({ value }: { value: string }) {
  return <label className="field"><span>Mês</span><input type="month" name="mes" defaultValue={value} /></label>;
}
