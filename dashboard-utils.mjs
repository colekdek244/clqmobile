export const hitungPersenKunjungan = (target, dikunjungi) => {
  const total = Number(target) || 0;
  const selesai = Number(dikunjungi) || 0;
  return total > 0 ? Math.min(100, Math.max(0, Math.round((selesai / total) * 100))) : 0;
};
