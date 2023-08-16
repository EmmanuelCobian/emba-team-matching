import styles from '@/styles/BouncingDots.module.css'

export default function BouncingDots() {
    return (
        <div className={styles.bouncingLoader}>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
}