const { makeStyles } = require("@mui/styles");

const useHeaderStyles = makeStyles((theme) => ({
    appbar: {
        backgroundColor: 'rgba(31,41,55,1) !important',
        paddingLeft: '2rem',
        paddingRight: '2rem',
    },
    topScroll: {
        backgroundColor: 'rgba(31,41,55,1) !important',
    },
}));

export default useHeaderStyles;