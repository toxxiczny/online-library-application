import styled from 'styled-components/macro'

import hooks from 'hooks'

export default styled.div`
    width: 100%;
    height: ${() => `calc(${hooks.useHeight()} - 242px)`};
    padding: 1px 0px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    @media (max-width: 800px) {
        height: ${() => `calc(${hooks.useHeight()} - 242px)`};
    }
    ::-webkit-scrollbar {
        display: none;
    }
`