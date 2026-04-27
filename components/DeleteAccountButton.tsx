'use client'

export default function DeleteAccountButton() {
  function handleClick() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    if (confirmed) {
      // Deletion logic to be implemented
      alert('Account deletion is not yet available.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-lg border border-danger-border px-4 py-2 text-sm font-medium text-danger-fg transition-colors hover:bg-danger-bg"
    >
      Delete Account
    </button>
  )
}
