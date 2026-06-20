import React from "react";
import { Toaster } from "sonner";

const Confirmation = ({
  id,
  setDeleteId,
  handleDeletecategoryConfirm,
}: {
  id: string;
  setDeleteId: any;
  handleDeletecategoryConfirm;
}) => {
  return (
    <dialog id={id} className="modal">
      <Toaster />
      <div className="modal-box">
        <h3 className="font-bold text-lg">Hapus category</h3>
        <p className="py-4">
          Apakah Anda yakin ingin menghapus category ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                const dialog = document.getElementById(
                  "delete-category-confirm",
                ) as HTMLDialogElement;
                dialog?.close();
                setDeleteId(null);
              }}
              className="btn btn-outline"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeletecategoryConfirm}
              className="btn px-3 btn-error text-white"
            >
              Hapus
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          onClick={() => {
            setDeleteId(null);
          }}
        >
          close
        </button>
      </form>
    </dialog>
  );
};
export default Confirmation;
