const { makeStyles } = require("@mui/styles");

const useAdminStyle = makeStyles((theme) => ({
    addHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyTypSection: {
        height: '400px',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    historyItems: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    overallGrid: {
        display: 'flex'
    },
    grid: {
        width: '8%',
        textAlign: 'center'
    },
    firstgrid: {
        width: '12%',
        textAlign: 'left'
    },
    percentGrid: {
        width: '9%',
        textAlign: 'center'
    },
    perLabel: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '8%'
    },
    fullWidth: {
        width: '65%'
    }
}));

export default useAdminStyle;